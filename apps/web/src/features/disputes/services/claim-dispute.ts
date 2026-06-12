import 'server-only'
import { prisma } from '@/lib/db'

/**
 * E-T27.3 — admin claims an open dispute, flipping it to IN_REVIEW.
 * Idempotent on the same admin (already in review by you → ok).
 */

export type ClaimDisputeOutcome =
  | { kind: 'ok'; disputeId: string }
  | { kind: 'dispute_not_found' }
  | { kind: 'wrong_status'; status: string }

export async function claimDispute(
  disputeId: string,
  adminUserId: string,
): Promise<ClaimDisputeOutcome> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    select: { id: true, status: true, resolvedById: true },
  })
  if (!dispute) return { kind: 'dispute_not_found' }
  if (dispute.status === 'IN_REVIEW' && dispute.resolvedById === adminUserId) {
    return { kind: 'ok', disputeId }
  }
  if (dispute.status !== 'OPEN' && dispute.status !== 'IN_REVIEW') {
    return { kind: 'wrong_status', status: dispute.status }
  }
  await prisma.dispute.update({
    where: { id: disputeId },
    data: { status: 'IN_REVIEW', resolvedById: adminUserId },
  })
  return { kind: 'ok', disputeId }
}
