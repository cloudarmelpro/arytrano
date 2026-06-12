import 'server-only'
import { prisma } from '@/lib/db'

/**
 * E-T27.3 — admin claims an open dispute, flipping it to IN_REVIEW.
 *
 * SECURITY (audit fix 2026-06-12) — claim is RECORDED in a dedicated
 * column `claimedById` rather than reusing `resolvedById`. This closes
 * a hijack vector where admin B could overwrite admin A's
 * `resolvedById` and then resolve in A's place. Now :
 *   - OPEN -> the first admin to claim wins and is written to
 *     `claimedById`. Status flips to IN_REVIEW.
 *   - IN_REVIEW + same admin -> no-op (idempotent).
 *   - IN_REVIEW + DIFFERENT admin -> REJECTED with `already_claimed`.
 *     A second admin can only take over via a separate, audit-logged
 *     "release" / "reassign" action (not implemented here — escalation
 *     happens out of band).
 *
 * The TOCTOU between findUnique and update is closed by a
 * conditional updateMany filtered on the prior status + null
 * `claimedById`. If two admins race on the OPEN claim, exactly one
 * row update lands ; the loser re-reads and gets `already_claimed`.
 */

export type ClaimDisputeOutcome =
  | { kind: 'ok'; disputeId: string }
  | { kind: 'dispute_not_found' }
  | { kind: 'already_claimed'; claimedBy: string }
  | { kind: 'wrong_status'; status: string }

export async function claimDispute(
  disputeId: string,
  adminUserId: string,
): Promise<ClaimDisputeOutcome> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    select: { id: true, status: true, claimedById: true },
  })
  if (!dispute) return { kind: 'dispute_not_found' }

  if (dispute.status === 'IN_REVIEW') {
    if (dispute.claimedById === adminUserId) {
      return { kind: 'ok', disputeId } // idempotent same-admin
    }
    return {
      kind: 'already_claimed',
      claimedBy: dispute.claimedById ?? 'unknown',
    }
  }
  if (dispute.status !== 'OPEN') {
    return { kind: 'wrong_status', status: dispute.status }
  }

  // Race-safe claim : only the row that is still OPEN AND has no
  // claimer wins. updateMany returns count = 0 for the loser ; we
  // re-read once to surface the winner.
  const result = await prisma.dispute.updateMany({
    where: { id: disputeId, status: 'OPEN', claimedById: null },
    data: {
      status: 'IN_REVIEW',
      claimedById: adminUserId,
      claimedAt: new Date(),
    },
  })
  if (result.count === 0) {
    const refetched = await prisma.dispute.findUnique({
      where: { id: disputeId },
      select: { claimedById: true, status: true },
    })
    if (refetched?.claimedById === adminUserId) {
      return { kind: 'ok', disputeId }
    }
    return {
      kind: 'already_claimed',
      claimedBy: refetched?.claimedById ?? 'unknown',
    }
  }

  return { kind: 'ok', disputeId }
}
