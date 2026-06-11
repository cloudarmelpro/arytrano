import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { writeLeadActivity } from './write-lead-activity'

/**
 * E-T28 T-RES-10 — cron (15 min) escalates NEW leads that have been
 * sitting in the queue for more than 4 hours without a claim. The
 * "escalation" today is a NO_RESPONSE_WARN LeadActivity + a Sentry
 * `warning` so the on-call sees it ; T-RES-09 will hook the push
 * fan-out to off-shift operators.
 *
 * Idempotent : a lead that already has an unanswered warn within the
 * last 4h is skipped. Without the dedupe the cron would spam an
 * activity row every 15 min.
 */

const ESCALATION_THRESHOLD_MS = 4 * 60 * 60 * 1000
const DEDUPE_WINDOW_MS = 4 * 60 * 60 * 1000

export type SweepUnclaimedLeadsResult = {
  scanned: number
  escalated: number
  skippedRecentWarn: number
}

export async function sweepUnclaimedLeads(opts?: {
  now?: Date
}): Promise<SweepUnclaimedLeadsResult> {
  const now = opts?.now ?? new Date()
  const threshold = new Date(now.getTime() - ESCALATION_THRESHOLD_MS)
  const dedupeFloor = new Date(now.getTime() - DEDUPE_WINDOW_MS)

  const candidates = await prisma.leadRequest.findMany({
    where: { status: 'NEW', createdAt: { lt: threshold } },
    select: { id: true, listingId: true },
    take: 200,
    orderBy: { createdAt: 'asc' },
  })

  if (candidates.length === 0) {
    return { scanned: 0, escalated: 0, skippedRecentWarn: 0 }
  }

  let escalated = 0
  let skippedRecentWarn = 0

  for (const lead of candidates) {
    try {
      const recentWarn = await prisma.leadActivity.findFirst({
        where: {
          leadId: lead.id,
          type: 'NO_RESPONSE_WARN',
          createdAt: { gte: dedupeFloor },
        },
        select: { id: true },
      })
      if (recentWarn) {
        skippedRecentWarn += 1
        continue
      }
      await writeLeadActivity(prisma, {
        leadId: lead.id,
        type: 'NO_RESPONSE_WARN',
        actorRole: 'SYSTEM',
        payload: {
          reason: 'unclaimed_over_4h',
          listingId: lead.listingId,
        },
      })
      escalated += 1
    } catch (err) {
      Sentry.captureException(err, {
        tags: { cron: 'sweep-unclaimed-leads', step: 'escalate' },
        extra: { leadId: lead.id },
      })
    }
  }

  if (escalated > 0) {
    Sentry.captureMessage('sweep-unclaimed-leads escalated', {
      level: 'warning',
      tags: { cron: 'sweep-unclaimed-leads' },
      extra: { scanned: candidates.length, escalated, skippedRecentWarn },
    })
  }

  return { scanned: candidates.length, escalated, skippedRecentWarn }
}
