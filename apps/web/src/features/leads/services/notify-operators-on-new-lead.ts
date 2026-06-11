import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { sendPush } from '@/lib/push/send-push'

/**
 * E-T28 T-RES-09 — push notification fan-out to on-shift operators
 * the instant a new LeadRequest hits the queue.
 *
 * Definition of "on shift" : an `OperatorShift` row where
 * `startsAt <= now < endsAt` for that operator's User id. Operators
 * declare their shift via the admin UI (not yet built — for v1,
 * shifts seed via a Prisma script or direct DB write).
 *
 * Anti-flood : we look at the last `LeadActivity` of type CREATED
 * the operator was notified for and skip if it's < 10 minutes ago.
 * Without this, an operator pinging the lead detail page back-to-
 * back could end up double-pinged on the next lead's fan-out.
 * We track the cooldown via a tiny "operator last-notified" in-
 * process Map seeded from the OperatorShift updatedAt — simple,
 * good enough for v1.
 *
 * Caller is expected to invoke this from `after()` so the public
 * lead-submission response isn't blocked on Expo's HTTP round-trip.
 */

const PER_OPERATOR_COOLDOWN_MS = 10 * 60 * 1000

export type NotifyOperatorsOnNewLeadResult = {
  candidates: number
  pushed: number
  skippedCooldown: number
  skippedNoToken: number
}

/**
 * In-process cooldown ledger. Lost on server restart — acceptable
 * since restarts are rare and a single missed push is no worse than
 * a delayed push. A Redis-backed key would be more robust if we
 * scale to multiple Node workers (not the case in v1).
 */
const lastNotifiedAt = new Map<string, number>()

export async function notifyOperatorsOnNewLead(
  leadId: string,
  context: { listingTitle: string; listingId: string },
): Promise<NotifyOperatorsOnNewLeadResult> {
  const now = Date.now()
  const nowDate = new Date(now)

  const shifts = await prisma.operatorShift.findMany({
    where: {
      startsAt: { lte: nowDate },
      endsAt: { gte: nowDate },
    },
    select: {
      operatorId: true,
      operator: { select: { expoPushToken: true, role: true } },
    },
    take: 50,
  })

  if (shifts.length === 0) {
    return { candidates: 0, pushed: 0, skippedCooldown: 0, skippedNoToken: 0 }
  }

  let pushed = 0
  let skippedCooldown = 0
  let skippedNoToken = 0

  const messages: Array<{
    to: string
    title: string
    body: string
    data: Record<string, unknown>
    sound: 'default'
    priority: 'high'
  }> = []

  for (const shift of shifts) {
    if (shift.operator.role !== 'ADMIN') continue
    const token = shift.operator.expoPushToken
    if (!token) {
      skippedNoToken += 1
      continue
    }
    const last = lastNotifiedAt.get(shift.operatorId) ?? 0
    if (now - last < PER_OPERATOR_COOLDOWN_MS) {
      skippedCooldown += 1
      continue
    }
    lastNotifiedAt.set(shift.operatorId, now)
    messages.push({
      to: token,
      title: 'Nouveau lead AryTrano',
      body: `${context.listingTitle.slice(0, 80)} — à claim`,
      data: { kind: 'leadRequest', leadId, listingId: context.listingId },
      sound: 'default',
      priority: 'high',
    })
  }

  if (messages.length === 0) {
    return {
      candidates: shifts.length,
      pushed: 0,
      skippedCooldown,
      skippedNoToken,
    }
  }

  try {
    const result = await sendPush(messages)
    pushed = result.accepted
  } catch (err) {
    Sentry.captureException(err, {
      tags: { feature: 'leads', step: 'notify-operators-on-new-lead' },
      extra: { leadId, listingId: context.listingId },
    })
  }

  return {
    candidates: shifts.length,
    pushed,
    skippedCooldown,
    skippedNoToken,
  }
}
