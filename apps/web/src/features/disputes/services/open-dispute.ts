import 'server-only'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import type { OpenDisputeInput } from '../schemas'

/**
 * E-T27.3 — open a Dispute. Either party of a Lease can open. We
 * cap one OPEN/IN_REVIEW dispute per lease at a time ; previously
 * resolved disputes can coexist.
 *
 * The cap is now enforced by a PARTIAL UNIQUE INDEX (migration
 * 20260612120000) — the prior service-side findFirst+create had a
 * TOCTOU window. We still do a friendly pre-check to return a
 * clean outcome, then catch P2002 as the race-loser.
 *
 * We also SNAPSHOT lease.status at open time into
 * `leaseStatusAtOpen`. The resolve step restores the lease to THAT
 * status — opening a frivolous dispute on an ACTIVE lease no longer
 * unilaterally ends the bail when the verdict is rendered.
 *
 * Side effects in a single tx :
 *  - Insert Dispute (status OPEN, slaDueAt = now + 7 days, snapshot)
 *  - Insert DisputeMessage (the initial claim, isVerdict=false)
 *  - Flip Lease.status to DISPUTED
 */

const SLA_MS = 7 * 24 * 60 * 60 * 1000

export type OpenDisputeOutcome =
  | { kind: 'ok'; disputeId: string; slaDueAt: Date }
  | { kind: 'lease_not_found' }
  | { kind: 'not_a_party' }
  | { kind: 'wrong_lease_status'; currentStatus: string }
  | { kind: 'already_open' }

export async function openDispute(
  input: OpenDisputeInput,
  userId: string,
): Promise<OpenDisputeOutcome> {
  const lease = await prisma.lease.findUnique({
    where: { id: input.leaseId },
    select: {
      id: true,
      status: true,
      ownerId: true,
      tenantId: true,
    },
  })
  if (!lease) return { kind: 'lease_not_found' }
  if (lease.ownerId !== userId && lease.tenantId !== userId) {
    return { kind: 'not_a_party' }
  }
  // Disputes can only be raised on TERMINATED or ACTIVE leases.
  // ACTIVE is allowed so a tenant who finds early damage can flag it
  // before keys are returned (rare but legit).
  if (!['ACTIVE', 'TERMINATED'].includes(lease.status)) {
    return { kind: 'wrong_lease_status', currentStatus: lease.status }
  }

  const role = lease.ownerId === userId ? 'OWNER' : 'TENANT'
  const leaseStatusAtOpen = lease.status
  const now = new Date()
  const slaDueAt = new Date(now.getTime() + SLA_MS)

  try {
    const dispute = await prisma.$transaction(async (tx) => {
      const d = await tx.dispute.create({
        data: {
          leaseId: lease.id,
          openedById: userId,
          openedByRole: role,
          initialClaim: input.initialClaim,
          amountAtStakeMGA: input.amountAtStakeMGA,
          leaseStatusAtOpen,
          slaDueAt,
        },
        select: { id: true, slaDueAt: true },
      })
      await tx.disputeMessage.create({
        data: {
          disputeId: d.id,
          authorId: userId,
          authorRole: role,
          body: input.initialClaim,
          isVerdict: false,
        },
      })
      // Flip lease status to DISPUTED. updateMany with the source
      // status filter so a parallel transition can't race.
      await tx.lease.updateMany({
        where: { id: lease.id, status: leaseStatusAtOpen },
        data: { status: 'DISPUTED' },
      })
      return d
    })
    return { kind: 'ok', disputeId: dispute.id, slaDueAt: dispute.slaDueAt }
  } catch (err) {
    // Partial unique index caught a concurrent open — race-loser.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return { kind: 'already_open' }
    }
    throw err
  }
}
