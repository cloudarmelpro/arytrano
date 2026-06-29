import 'server-only'
import { createHash } from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import type { PaymentPurpose, PaymentStatus } from '@prisma/client'
import type { WebhookEvent } from '@/lib/payments/types'
import { stripC0FromJson } from '@/lib/format/strip-c0'

/**
 * PAY-14 — canonical dedup key for a webhook event. Computed over the
 * tuple that defines event identity (NOT raw body — that varies by
 * whitespace + key order). Two events with the same key are treated
 * as the same event regardless of which retry the provider sent.
 */
function buildDedupKey(event: WebhookEvent): string {
  const canonical = JSON.stringify({
    r: event.reference,
    e: event.event,
    o: event.orderReference,
    a: event.amountMGA,
  })
  return createHash('sha256').update(canonical).digest('hex')
}

/**
 * Idempotent state machine for recording an inbound GoalPay webhook.
 *
 * Contract :
 *   - Idempotent on `reference` (= Payment.idempotencyKey). Replay of
 *     the same event on a terminal Payment is a noop (still records
 *     a PaymentEvent audit row).
 *   - Transitions allowed: INITIATED → {CONFIRMED, FAILED, CANCELED, EXPIRED}.
 *     Any other current status (already terminal, REFUND_PENDING, etc.)
 *     short-circuits to noop on status, but the event is still audited.
 *   - Validates `amount` and `providerTxId` against the stored row to
 *     reject spoofed/mismatched payloads (return `'mismatch'` outcome).
 *
 * Side effects beyond the Payment row are handled by downstream
 * callers (e.g. E-T26 lease activation reacts to CONFIRMED for a
 * Payment with `purpose=LEASE_SUCCESS_FEE`). This service stays narrow
 * and database-only — easy to unit test.
 */

const eventToStatus: Record<WebhookEvent['event'], PaymentStatus> = {
  'payment.success': 'CONFIRMED',
  'payment.failed': 'FAILED',
  'payment.canceled': 'CANCELED',
  'payment.expired': 'EXPIRED',
}

const TERMINAL_STATUSES: ReadonlySet<PaymentStatus> = new Set<PaymentStatus>([
  'CONFIRMED',
  'FAILED',
  'CANCELED',
  'EXPIRED',
  'REFUND_PENDING',
  'REFUNDED',
])

export type RecordWebhookOutcome =
  /** First time we see this event; Payment status updated. */
  | {
      kind: 'applied'
      paymentId: string
      newStatus: PaymentStatus
      purpose: PaymentPurpose
    }
  /** Replay or duplicate event; Payment already in a terminal state. */
  | { kind: 'noop'; paymentId: string; existingStatus: PaymentStatus }
  /** No Payment row matches the reference echoed by GoalPay. */
  | { kind: 'unknown_reference'; reference: string }
  /** Amount or providerTxId on the event doesn't match our row. */
  | { kind: 'mismatch'; paymentId: string; reason: 'amount' | 'providerTxId' }

export async function recordWebhookEvent(
  event: WebhookEvent,
): Promise<RecordWebhookOutcome> {
  // PAY-14 — short-circuit on exact-replay before any further work.
  // If the same event tuple was already recorded, return noop without
  // re-running the transition or audit insert.
  const dedupKey = buildDedupKey(event)
  const priorReplay = await prisma.paymentEvent.findUnique({
    where: { dedupKey },
    select: { paymentId: true, payment: { select: { status: true } } },
  })
  if (priorReplay) {
    return {
      kind: 'noop',
      paymentId: priorReplay.paymentId,
      existingStatus: priorReplay.payment.status,
    }
  }

  const existing = await prisma.payment.findUnique({
    where: { idempotencyKey: event.reference },
    select: {
      id: true,
      status: true,
      amountMGA: true,
      providerTxId: true,
      purpose: true,
    },
  })

  if (!existing) {
    // SEC-L1 audit fix — capture to Sentry so HMAC-valid events for
    // unknown references stay forensically visible (could be a stale
    // dev event hitting prod, or a race we accept — we want to know).
    Sentry.captureMessage('webhook event for unknown reference', {
      level: 'warning',
      tags: { kind: 'unknown_reference' },
      extra: { reference: event.reference, event: event.event },
    })
    return { kind: 'unknown_reference', reference: event.reference }
  }

  // Defensive : a hijacked / replayed webhook with a tampered amount
  // would be flagged here. The signature check upstream is the primary
  // defense; this is belt-and-suspenders.
  if (existing.amountMGA !== event.amountMGA) {
    return {
      kind: 'mismatch',
      paymentId: existing.id,
      reason: 'amount',
    }
  }

  // Audit P-M3 fix — `payment.success` with amount=0 is suspect. Zod
  // schema accepts `nonnegative` so 0 passes validation, but no
  // legitimate Mobile Money success goes through at 0. Likely a
  // provider bug OR an upstream listing with priceMonthlyMGA=0 that
  // got past validation. Surface as mismatch so the admin investigates.
  if (event.event === 'payment.success' && event.amountMGA === 0) {
    return {
      kind: 'mismatch',
      paymentId: existing.id,
      reason: 'amount',
    }
  }

  // If we already recorded a providerTxId on an earlier webhook for the
  // same reference, it must match. (GoalPay won't normally send two
  // different order_references for the same reference, but worth
  // enforcing.)
  if (
    existing.providerTxId &&
    existing.providerTxId !== event.orderReference
  ) {
    return {
      kind: 'mismatch',
      paymentId: existing.id,
      reason: 'providerTxId',
    }
  }

  const targetStatus = eventToStatus[event.event]
  const now = new Date()

  // SEC-M4 audit fix — scrub C0 controls (U+0000 etc.) from the
  // provider payload before it hits JSONB. Postgres rejects NUL bytes
  // and may misbehave on other C0 codes; a single rogue byte from a
  // provider quirk would flip a valid `payment.success` event into a
  // 500. HMAC validates origin, not hygiene.
  const safePayload = stripC0FromJson(event) as unknown as object

  // Idempotent path : already terminal → record audit only.
  if (TERMINAL_STATUSES.has(existing.status)) {
    // PAY-14 — catch race-with-replay on the unique dedupKey index. If
    // two webhook handlers raced past the priorReplay check above, the
    // second insert hits the unique violation; treat it as noop.
    try {
      await prisma.paymentEvent.create({
        data: {
          paymentId: existing.id,
          status: targetStatus,
          rawPayload: safePayload,
          dedupKey,
        },
      })
    } catch (err) {
      if (
        !(err instanceof Prisma.PrismaClientKnownRequestError) ||
        err.code !== 'P2002'
      ) {
        throw err
      }
    }
    return {
      kind: 'noop',
      paymentId: existing.id,
      existingStatus: existing.status,
    }
  }

  // First-time terminal transition.
  //
  // Audit H2 fix — use a CONDITIONAL `updateMany` inside the transaction
  // so the existence-of-non-terminal check is atomic with the flip.
  // Without this, two concurrent webhooks for the same Payment could
  // both pass the stale `findUnique` check above (lines 61-70) and both
  // commit an `applied` outcome, doubling downstream side-effects
  // (email tenant invite, lease activation). The `where.status` filter
  // means a row already flipped by a concurrent handler is silently
  // skipped, and `updated.count` tells us whether we won the race.
  let txResult: number
  try {
    txResult = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.updateMany({
        where: {
          id: existing.id,
          status: { in: ['INITIATED', 'PENDING'] },
        },
        data: {
          status: targetStatus,
          webhookReceivedAt: now,
          providerTxId: event.orderReference,
          ...(targetStatus === 'CONFIRMED' ? { completedAt: now } : {}),
        },
      })
      // Always audit, even when we lost the race — the event arrived
      // and belongs in the immutable trail. The audit row's `status`
      // records what the event WOULD have transitioned to, not the
      // post-flip Payment.status (which `updateMany.count === 0` proves
      // was already terminal by another writer).
      await tx.paymentEvent.create({
        data: {
          paymentId: existing.id,
          status: targetStatus,
          rawPayload: safePayload,
          dedupKey,
        },
      })
      return updated.count
    })
  } catch (err) {
    // PAY-14 — concurrent replay of the SAME dedupKey lost the audit
    // insert race. The other handler did the side effects; we report
    // noop without re-dispatching.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return {
        kind: 'noop',
        paymentId: existing.id,
        existingStatus: existing.status,
      }
    }
    throw err
  }

  if (txResult === 0) {
    // Race lost — a concurrent webhook handler flipped the row first.
    // Return noop so the route handler does NOT re-dispatch downstream
    // side-effects (they already ran on the winning call).
    return {
      kind: 'noop',
      paymentId: existing.id,
      existingStatus: existing.status,
    }
  }

  return {
    kind: 'applied',
    paymentId: existing.id,
    newStatus: targetStatus,
    purpose: existing.purpose,
  }
}
