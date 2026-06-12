import 'server-only'
import { prisma } from '@/lib/db'
import type { ResolveDisputeInput } from '../schemas'

/**
 * E-T27.3 — admin renders a verdict and resolves a dispute.
 *
 * Side effects (atomic) :
 *  - Update Dispute (status RESOLVED_*, resolvedAt, verdict)
 *  - Insert a final DisputeMessage with isVerdict=true
 *  - Flip Lease.status TERMINATED (if previously DISPUTED) so the
 *    lease lifecycle returns to its terminal state. ACTIVE-time
 *    disputes stay ACTIVE (the parties keep going).
 *
 * The verdict text is the admin's reasoning, displayed to both
 * parties via email + dashboard.
 */

export type ResolveDisputeOutcome =
  | { kind: 'ok'; disputeId: string; resolution: string }
  | { kind: 'dispute_not_found' }
  | { kind: 'not_reviewer'; assignedTo: string | null }
  | { kind: 'wrong_status'; status: string }

export async function resolveDispute(
  input: ResolveDisputeInput,
  adminUserId: string,
): Promise<ResolveDisputeOutcome> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: input.disputeId },
    select: {
      id: true,
      status: true,
      resolvedById: true,
      leaseId: true,
      lease: { select: { status: true } },
    },
  })
  if (!dispute) return { kind: 'dispute_not_found' }
  if (
    dispute.status === 'OPEN' ||
    !['IN_REVIEW'].includes(dispute.status)
  ) {
    if (dispute.status !== 'IN_REVIEW') {
      return { kind: 'wrong_status', status: dispute.status }
    }
  }
  if (dispute.resolvedById && dispute.resolvedById !== adminUserId) {
    return { kind: 'not_reviewer', assignedTo: dispute.resolvedById }
  }

  const now = new Date()
  // Determine the audited role for the verdict message — admins
  // are flagged as OWNER role by convention in the activity log.
  // Real ruling lives in the dispute.verdict field.
  await prisma.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id: dispute.id },
      data: {
        status: input.resolution,
        verdict: input.verdict,
        resolvedAt: now,
        resolvedById: adminUserId,
      },
    })
    await tx.disputeMessage.create({
      data: {
        disputeId: dispute.id,
        authorId: adminUserId,
        authorRole: 'OWNER', // surfaced as admin in UI via isVerdict flag
        body: input.verdict,
        isVerdict: true,
      },
    })
    // Restore the lease to TERMINATED so it leaves the DISPUTED state.
    if (dispute.lease.status === 'DISPUTED') {
      await tx.lease.update({
        where: { id: dispute.leaseId },
        data: { status: 'TERMINATED', terminatedAt: now },
      })
    }
  })

  return {
    kind: 'ok',
    disputeId: dispute.id,
    resolution: input.resolution,
  }
}
