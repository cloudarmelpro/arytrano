import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { applyLeasePaymentSideEffect } from './apply-lease-payment-side-effect'

/**
 * S2-18 — reconcile stuck lease activations.
 *
 * The webhook handler at /api/webhooks/goalpay calls
 * `applyLeasePaymentSideEffect` AFTER `recordWebhookEvent` has
 * committed the Payment.CONFIRMED transition. The two writes are NOT
 * in the same DB transaction (the side-effect runs lease/listing
 * updates + email/push that intentionally live outside the
 * Payment-only tx for atomicity reasons).
 *
 * If the process crashes (or the side-effect throws an unhandled
 * exception) between the Payment commit and the side-effect commit,
 * we end up with :
 *
 *   Payment.status = CONFIRMED
 *   Lease.status   = PENDING_TENANT (should be ACTIVE)
 *
 * The user paid for nothing as far as the dashboard is concerned.
 * GoalPay will NOT retry — we already returned 200 to them.
 *
 * This cron sweeps the DB once per hour, finds those zombies, and
 * replays the side-effect. The side-effect itself is idempotent
 * (already_active branch), so re-running on a row that DID transition
 * normally is a noop.
 */

export type ReconcileStuckLeaseActivationsResult = {
  scanned: number
  replayed: number
  alreadyActive: number
  failed: number
}

export async function reconcileStuckLeaseActivations(): Promise<ReconcileStuckLeaseActivationsResult> {
  // Find Leases stuck in PENDING_TENANT whose linked Payment is
  // already CONFIRMED. The CONFIRMED Payment means the webhook DID
  // arrive — only the side-effect leg failed to advance the lease.
  const stuck = await prisma.lease.findMany({
    where: {
      status: 'PENDING_TENANT',
      payment: { status: 'CONFIRMED' },
    },
    select: { id: true, paymentId: true },
    take: 200,
    orderBy: { updatedAt: 'asc' },
  })

  if (stuck.length === 0) {
    return { scanned: 0, replayed: 0, alreadyActive: 0, failed: 0 }
  }

  let replayed = 0
  let alreadyActive = 0
  let failed = 0

  for (const lease of stuck) {
    if (!lease.paymentId) continue
    try {
      const outcome = await applyLeasePaymentSideEffect(
        lease.paymentId,
        'CONFIRMED',
      )
      switch (outcome.kind) {
        case 'lease_now_active':
          replayed += 1
          break
        case 'already_active':
          // The lease transitioned between our findMany and the
          // side-effect call — fine. Counted separately so the
          // cron telemetry stays honest about what it actually
          // moved vs what was already moved.
          alreadyActive += 1
          break
        case 'race_lost_marked_refused':
          // The retry hit the partial unique index. The side-effect
          // queued a refund itself — log it as "moved" since the
          // lease did exit PENDING_TENANT.
          replayed += 1
          break
        case 'no_lease_linked':
        case 'noop':
          // Shouldn't happen given our where clause, but defensive.
          break
      }
    } catch (err) {
      failed += 1
      Sentry.captureException(err, {
        tags: {
          cron: 'reconcile-stuck-lease-activations',
          step: 'replay-side-effect',
        },
        extra: { leaseId: lease.id, paymentId: lease.paymentId },
      })
    }
  }

  if (replayed > 0) {
    Sentry.captureMessage(
      'reconcile-stuck-lease-activations replayed stuck rows',
      {
        level: 'warning',
        tags: { cron: 'reconcile-stuck-lease-activations' },
        extra: {
          scanned: stuck.length,
          replayed,
          alreadyActive,
          failed,
        },
      },
    )
  }

  return {
    scanned: stuck.length,
    replayed,
    alreadyActive,
    failed,
  }
}
