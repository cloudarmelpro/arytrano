import 'server-only'
import { prisma } from '@/lib/db'
import type { OpenDisputeInput } from '../schemas'

/**
 * E-T27.3 — open a Dispute. Either party of a Lease can open. We
 * cap one OPEN/IN_REVIEW dispute per lease at a time to keep the
 * admin queue tractable ; previously resolved disputes can coexist.
 *
 * Side effects in a single tx :
 *  - Insert Dispute (status OPEN, slaDueAt = now + 7 days)
 *  - Insert DisputeMessage (the initial claim, isVerdict=false)
 *  - Flip Lease.status to DISPUTED
 */

const SLA_MS = 7 * 24 * 60 * 60 * 1000

export type OpenDisputeOutcome =
  | { kind: 'ok'; disputeId: string; slaDueAt: Date }
  | { kind: 'lease_not_found' }
  | { kind: 'not_a_party' }
  | { kind: 'wrong_lease_status'; currentStatus: string }
  | { kind: 'already_open'; existingDisputeId: string }

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

  const existing = await prisma.dispute.findFirst({
    where: {
      leaseId: lease.id,
      status: { in: ['OPEN', 'IN_REVIEW'] },
    },
    select: { id: true },
  })
  if (existing) {
    return { kind: 'already_open', existingDisputeId: existing.id }
  }

  const role = lease.ownerId === userId ? 'OWNER' : 'TENANT'
  const now = new Date()
  const slaDueAt = new Date(now.getTime() + SLA_MS)

  const dispute = await prisma.$transaction(async (tx) => {
    const d = await tx.dispute.create({
      data: {
        leaseId: lease.id,
        openedById: userId,
        openedByRole: role,
        initialClaim: input.initialClaim,
        amountAtStakeMGA: input.amountAtStakeMGA,
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
      where: { id: lease.id, status: lease.status },
      data: { status: 'DISPUTED' },
    })
    return d
  })

  return { kind: 'ok', disputeId: dispute.id, slaDueAt: dispute.slaDueAt }
}
