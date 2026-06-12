import 'server-only'
import { prisma } from '@/lib/db'
import type { ResolveDisputeInput } from '../schemas'

/**
 * E-T27.3 — admin renders a verdict and resolves a dispute.
 *
 * SECURITY (audit fix 2026-06-12) :
 *  - Only the CLAIMER admin (`claimedById`) can resolve. Previously
 *    the check was on `resolvedById` which doubled as a claim marker,
 *    opening a hijack vector.
 *  - The lease is restored to `leaseStatusAtOpen` (the snapshot
 *    taken when the dispute was opened) instead of being forced to
 *    TERMINATED. An ACTIVE-time dispute that ends leaves the lease
 *    ACTIVE, so a frivolous opener cannot unilaterally end the bail.
 *  - The lease flip uses `updateMany` with a `status: 'DISPUTED'`
 *    guard so two concurrent resolutions cannot overwrite each
 *    other's restoration.
 *
 * Side effects (atomic) :
 *  - Update Dispute (status RESOLVED_*, resolvedAt, verdict,
 *    resolvedById = the resolving admin)
 *  - Insert a final DisputeMessage with isVerdict=true
 *  - Restore Lease.status from the snapshot if it's still DISPUTED.
 */

export type ResolveDisputeOutcome =
  | { kind: 'ok'; disputeId: string; resolution: string }
  | { kind: 'dispute_not_found' }
  | { kind: 'not_claimer'; claimedBy: string | null }
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
      claimedById: true,
      leaseId: true,
      leaseStatusAtOpen: true,
      lease: { select: { status: true } },
    },
  })
  if (!dispute) return { kind: 'dispute_not_found' }
  if (dispute.status !== 'IN_REVIEW') {
    return { kind: 'wrong_status', status: dispute.status }
  }
  if (dispute.claimedById !== adminUserId) {
    return { kind: 'not_claimer', claimedBy: dispute.claimedById }
  }

  const now = new Date()
  const restoredLeaseStatus = dispute.leaseStatusAtOpen
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
        // The verdict row carries a role only as cosmetic metadata —
        // the UI checks isVerdict, not the role. We map by resolution
        // for log readability.
        authorRole:
          input.resolution === 'RESOLVED_TENANT' ? 'TENANT' : 'OWNER',
        body: input.verdict,
        isVerdict: true,
      },
    })
    // Restore the lease to its pre-dispute status. Guard on
    // `status: 'DISPUTED'` so a parallel resolution can't overwrite
    // the row twice.
    if (dispute.lease.status === 'DISPUTED') {
      await tx.lease.updateMany({
        where: { id: dispute.leaseId, status: 'DISPUTED' },
        data: {
          status: restoredLeaseStatus,
          // terminatedAt is only meaningful if the snapshot was
          // already TERMINATED. ACTIVE-time disputes leave it null.
          ...(restoredLeaseStatus === 'TERMINATED'
            ? { terminatedAt: now }
            : {}),
        },
      })
    }
  })

  return {
    kind: 'ok',
    disputeId: dispute.id,
    resolution: input.resolution,
  }
}
