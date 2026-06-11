import 'server-only'
import { prisma } from '@/lib/db'
import { writeLeadActivity } from './write-lead-activity'

/**
 * E-T28 T-RES-02 — operator claims a NEW lead from /admin/leads.
 *
 * Server-enforced WIP cap = 6 per operator (decision 2026-06-10). The
 * cap is checked + the claim is written inside a single SERIALIZABLE
 * transaction so two operators racing on the same lead can't both
 * succeed (the second hits a Prisma uniqueness conflict resolved as
 * `kind:already_claimed`).
 *
 * `slaDueAt` = claimedAt + 4h. The `sweep-stale-claimed` cron scans
 * `WHERE status='CLAIMED' AND slaDueAt < now()` via the
 * `[status, slaDueAt]` index.
 *
 * Caller MUST verify the operator has the ADMIN role at the action /
 * handler boundary — the service trusts the operatorId.
 */

export type ClaimLeadOutcome =
  | { kind: 'ok'; leadId: string; slaDueAt: Date }
  | { kind: 'lead_not_found' }
  | { kind: 'already_claimed'; claimedByUserId: string }
  | { kind: 'invalid_status'; currentStatus: string }
  | { kind: 'wip_cap_reached'; cap: number; currentCount: number }

export const WIP_CAP_PER_OPERATOR = 6
export const CLAIM_SLA_MS = 4 * 60 * 60 * 1000

export async function claimLead(
  leadId: string,
  operatorId: string,
): Promise<ClaimLeadOutcome> {
  // The whole thing runs SERIALIZABLE so concurrent claims see a
  // consistent view (WIP count + lead status), and the conditional
  // update on (id, status='NEW') becomes the race winner.
  return prisma.$transaction(
    async (tx) => {
      const lead = await tx.leadRequest.findUnique({
        where: { id: leadId },
        select: { id: true, status: true, claimedByUserId: true },
      })
      if (!lead) return { kind: 'lead_not_found' } as const
      if (lead.claimedByUserId && lead.status === 'CLAIMED') {
        return {
          kind: 'already_claimed',
          claimedByUserId: lead.claimedByUserId,
        } as const
      }
      if (lead.status !== 'NEW') {
        return { kind: 'invalid_status', currentStatus: lead.status } as const
      }

      const currentCount = await tx.leadRequest.count({
        where: {
          claimedByUserId: operatorId,
          status: { in: ['CLAIMED', 'IN_DISCUSSION', 'AWAITING_OWNER', 'AWAITING_TENANT'] },
        },
      })
      if (currentCount >= WIP_CAP_PER_OPERATOR) {
        return {
          kind: 'wip_cap_reached',
          cap: WIP_CAP_PER_OPERATOR,
          currentCount,
        } as const
      }

      const now = new Date()
      const slaDueAt = new Date(now.getTime() + CLAIM_SLA_MS)

      // Conditional update — if a parallel claim already flipped the
      // row to CLAIMED, our updateMany returns count=0 and we fall to
      // the already_claimed branch.
      const updated = await tx.leadRequest.updateMany({
        where: { id: leadId, status: 'NEW' },
        data: {
          status: 'CLAIMED',
          claimedByUserId: operatorId,
          claimedAt: now,
          slaDueAt,
        },
      })
      if (updated.count === 0) {
        return {
          kind: 'already_claimed',
          claimedByUserId: operatorId, // race lost; fetch loses
        } as const
      }

      await writeLeadActivity(tx, {
        leadId,
        type: 'CLAIMED',
        actorRole: 'OPERATOR',
        actorUserId: operatorId,
        payload: { slaDueAt: slaDueAt.toISOString() },
      })

      return { kind: 'ok', leadId, slaDueAt } as const
    },
    { isolationLevel: 'Serializable' },
  )
}
