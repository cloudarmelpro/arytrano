import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { writeLeadActivity } from './write-lead-activity'

/**
 * E-T28 T-RES-10 — cron (1 h) auto-reverts CLAIMED leads whose SLA
 * deadline has passed without activity. Without this, an operator
 * going on vacation silently freezes their WIP slots.
 *
 * Conditions to revert :
 *  - status = CLAIMED (the cron doesn't touch IN_DISCUSSION etc. —
 *    once the operator actually engaged, the SLA is the operator's
 *    problem)
 *  - slaDueAt < now()
 *
 * On revert :
 *  - clear claimedByUserId + claimedAt + slaDueAt
 *  - flip status back to NEW
 *  - write a REASSIGNED LeadActivity referencing the original
 *    operator + the SLA deadline (audit trail)
 *
 * Race-safe via conditional `updateMany` — if another path (operator
 * just logged a MESSAGED, transition flipped to IN_DISCUSSION) won
 * the race, our count comes back 0 and we skip.
 */

export type SweepStaleClaimedLeadsResult = {
  scanned: number
  reverted: number
  failed: number
}

export async function sweepStaleClaimedLeads(opts?: {
  now?: Date
}): Promise<SweepStaleClaimedLeadsResult> {
  const now = opts?.now ?? new Date()

  const candidates = await prisma.leadRequest.findMany({
    where: {
      status: 'CLAIMED',
      slaDueAt: { not: null, lt: now },
    },
    select: { id: true, claimedByUserId: true, slaDueAt: true },
    take: 200,
    orderBy: { slaDueAt: 'asc' },
  })

  if (candidates.length === 0) {
    return { scanned: 0, reverted: 0, failed: 0 }
  }

  let reverted = 0
  let failed = 0

  for (const lead of candidates) {
    try {
      const result = await prisma.leadRequest.updateMany({
        where: { id: lead.id, status: 'CLAIMED' },
        data: {
          status: 'NEW',
          claimedByUserId: null,
          claimedAt: null,
          slaDueAt: null,
        },
      })
      if (result.count === 0) continue
      reverted += 1
      await writeLeadActivity(prisma, {
        leadId: lead.id,
        type: 'REASSIGNED',
        actorRole: 'SYSTEM',
        actorUserId: lead.claimedByUserId,
        payload: {
          reason: 'sla_expired',
          slaDueAt: lead.slaDueAt?.toISOString() ?? null,
          previousClaimer: lead.claimedByUserId,
        },
      })
    } catch (err) {
      failed += 1
      Sentry.captureException(err, {
        tags: { cron: 'sweep-stale-claimed-leads', step: 'revert' },
        extra: { leadId: lead.id },
      })
    }
  }

  if (reverted > 0) {
    Sentry.captureMessage('sweep-stale-claimed-leads reverted', {
      level: 'warning',
      tags: { cron: 'sweep-stale-claimed-leads' },
      extra: { scanned: candidates.length, reverted, failed },
    })
  }

  return { scanned: candidates.length, reverted, failed }
}
