import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { writeLeadActivity } from './write-lead-activity'

/**
 * E-T28 T-RES-10 — cron (daily) archives leads that have been in an
 * in-flight status (IN_DISCUSSION / AWAITING_OWNER / AWAITING_TENANT)
 * for more than 14 days WITHOUT any non-SYSTEM activity. Pure SYSTEM
 * activities (cron warns) don't reset the clock.
 *
 * Transition: in-flight status → LAPSED + writes a LAPSED activity.
 * Race-safe via conditional `updateMany` keyed off the current status.
 */

const LAPSED_THRESHOLD_DAYS = 14
const LAPSED_THRESHOLD_MS = LAPSED_THRESHOLD_DAYS * 24 * 60 * 60 * 1000

const IN_FLIGHT_STATUSES = [
  'IN_DISCUSSION',
  'AWAITING_OWNER',
  'AWAITING_TENANT',
] as const

export type SweepLapsedLeadsResult = {
  scanned: number
  lapsed: number
  failed: number
}

export async function sweepLapsedLeads(opts?: {
  now?: Date
}): Promise<SweepLapsedLeadsResult> {
  const now = opts?.now ?? new Date()
  const threshold = new Date(now.getTime() - LAPSED_THRESHOLD_MS)

  // Pull candidates : in-flight + updatedAt older than 14 days. We
  // re-check the "last non-SYSTEM activity" inside the loop because
  // updatedAt is also bumped by SYSTEM writes (Prisma updates the
  // column on every row write). Without this we'd let a chatty cron
  // perpetually delay the archive.
  const candidates = await prisma.leadRequest.findMany({
    where: {
      status: { in: [...IN_FLIGHT_STATUSES] },
      updatedAt: { lt: threshold },
    },
    select: { id: true, status: true },
    take: 200,
    orderBy: { updatedAt: 'asc' },
  })

  if (candidates.length === 0) {
    return { scanned: 0, lapsed: 0, failed: 0 }
  }

  let lapsed = 0
  let failed = 0

  for (const lead of candidates) {
    try {
      const lastHumanActivity = await prisma.leadActivity.findFirst({
        where: { leadId: lead.id, actorRole: { not: 'SYSTEM' } },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      })
      const reference = lastHumanActivity?.createdAt ?? new Date(0)
      if (reference >= threshold) continue

      const result = await prisma.leadRequest.updateMany({
        where: { id: lead.id, status: lead.status },
        data: { status: 'LAPSED' },
      })
      if (result.count === 0) continue
      lapsed += 1
      await writeLeadActivity(prisma, {
        leadId: lead.id,
        type: 'LAPSED',
        actorRole: 'SYSTEM',
        payload: {
          reason: 'no_human_activity_over_14d',
          previousStatus: lead.status,
        },
      })
    } catch (err) {
      failed += 1
      Sentry.captureException(err, {
        tags: { cron: 'sweep-lapsed-leads', step: 'lapse' },
        extra: { leadId: lead.id },
      })
    }
  }

  if (lapsed > 0) {
    Sentry.captureMessage('sweep-lapsed-leads archived', {
      level: 'info',
      tags: { cron: 'sweep-lapsed-leads' },
      extra: { scanned: candidates.length, lapsed, failed },
    })
  }

  return { scanned: candidates.length, lapsed, failed }
}
