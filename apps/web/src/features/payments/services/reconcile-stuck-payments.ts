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

  // PERF-M2 audit fix — bulk `updateMany` + `createMany` in a single
  // transaction. The previous serial loop made one round-trip per row
  // (~10-20ms each on a hosted DB); at 500 stuck payments that's
  // 5-10s of wall time, dangerously close to serverless cron timeouts.
  // Now we issue exactly two SQL statements regardless of batch size.
  const ids = stuck.map((p) => p.id)
  const now = new Date()
  const ranAtIso = now.toISOString()
  const auditRows = ids.map((id) => ({
    paymentId: id,
    status: 'EXPIRED' as const,
    rawPayload: {
      source: 'reconciliation_cron',
      reason: `stuck >${minutes}min in INITIATED/PENDING`,
      ranAt: ranAtIso,
    },
  }))

  let markedExpired = 0
  try {
    const [updateResult] = await prisma.$transaction([
      prisma.payment.updateMany({
        where: { id: { in: ids } },
        data: { status: 'EXPIRED', webhookReceivedAt: now },
      }),
      prisma.paymentEvent.createMany({ data: auditRows }),
    ])
    markedExpired = updateResult.count
  } catch (err) {
    // Single transaction failure means none of the rows flipped — surface
    // the whole batch to Sentry so an admin can investigate. The cron
    // will retry naturally on the next tick.
    Sentry.captureException(err, {
      tags: { cron: 'reconcile-stuck-payments', step: 'expire-batch' },
      extra: { scanned: stuck.length, minutes },
    })
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
