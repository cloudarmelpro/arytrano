import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'

/**
 * E-T20 (minimal v1) — sweep Payments stuck in INITIATED / PENDING
 * past their GoalPay checkout TTL (10 min + grace).
 *
 * GoalPay has NO transaction lookup API (verified 2026-05-25), so we
 * can't poll their side for the real status. Best-effort: if a Payment
 * has stayed in INITIATED beyond `staleAfterMinutes`, mark it EXPIRED
 * and let the visitor re-initiate.
 *
 * M4 audit fix — threshold raised to 120 min so a delayed (but valid)
 * webhook from GoalPay's queue won't be expired in front of it. The
 * checkout link itself dies after 10 min, but the success webhook may
 * arrive minutes later under provider load.
 *
 * Audit trail: each transition writes a `PaymentEvent` row with a
 * synthetic payload that records the reconciliation reason — admins
 * can distinguish webhook-driven EXPIRED from cron-driven EXPIRED via
 * `rawPayload.source = 'reconciliation_cron'`.
 *
 * Future v2: when GoalPay exposes a status endpoint, call it before
 * deciding — a Payment may have succeeded but the webhook got lost.
 */

const DEFAULT_STALE_AFTER_MINUTES = 120

export type ReconcileResult = {
  scanned: number
  markedExpired: number
}

export async function reconcileStuckPayments(opts?: {
  staleAfterMinutes?: number
}): Promise<ReconcileResult> {
  const minutes = opts?.staleAfterMinutes ?? DEFAULT_STALE_AFTER_MINUTES
  const threshold = new Date(Date.now() - minutes * 60_000)

  const stuck = await prisma.payment.findMany({
    where: {
      status: { in: ['INITIATED', 'PENDING'] },
      createdAt: { lt: threshold },
    },
    select: { id: true },
    take: 500,
  })

  if (stuck.length === 0) return { scanned: 0, markedExpired: 0 }

  // Update + audit each one. Transaction per row keeps a single failure
  // from rolling back the whole batch; the cron retries naturally
  // on the next tick.
  let markedExpired = 0
  for (const p of stuck) {
    try {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: p.id },
          data: { status: 'EXPIRED', webhookReceivedAt: new Date() },
        }),
        prisma.paymentEvent.create({
          data: {
            paymentId: p.id,
            status: 'EXPIRED',
            rawPayload: {
              source: 'reconciliation_cron',
              reason: `stuck >${minutes}min in INITIATED/PENDING`,
              ranAt: new Date().toISOString(),
            },
          },
        }),
      ])
      markedExpired += 1
    } catch (err) {
      // M5 audit fix — surface per-row failures to Sentry instead of
      // swallowing silently. The batch continues so one bad row never
      // poisons the whole tick.
      Sentry.captureException(err, {
        tags: { cron: 'reconcile-stuck-payments', step: 'expire-one' },
        extra: { paymentId: p.id, minutes },
      })
    }
  }

  // M4 audit fix — alert when ANY rows were expired so an admin can
  // sanity-check provider health. `captureMessage` is cheap; the
  // captured tag lets us route to a low-priority channel.
  if (markedExpired > 0) {
    Sentry.captureMessage('reconcile-payments expired stuck rows', {
      level: 'warning',
      tags: { cron: 'reconcile-stuck-payments' },
      extra: { scanned: stuck.length, markedExpired, minutes },
    })
  }

  return { scanned: stuck.length, markedExpired }
}
