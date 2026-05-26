import 'server-only'
import { prisma } from '@/lib/db'
import type { PaymentPurpose, PaymentStatus } from '@prisma/client'
import type { WebhookEvent } from '@/lib/payments/types'

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

  // Idempotent path : already terminal → record audit only.
  if (TERMINAL_STATUSES.has(existing.status)) {
    await prisma.paymentEvent.create({
      data: {
        paymentId: existing.id,
        status: targetStatus,
        rawPayload: event as unknown as object,
      },
    })
    return {
      kind: 'noop',
      paymentId: existing.id,
      existingStatus: existing.status,
    }
  }

  // First-time terminal transition.
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: existing.id },
      data: {
        status: targetStatus,
        webhookReceivedAt: now,
        providerTxId: event.orderReference,
        ...(targetStatus === 'CONFIRMED' ? { completedAt: now } : {}),
      },
    }),
    prisma.paymentEvent.create({
      data: {
        paymentId: existing.id,
        status: targetStatus,
        rawPayload: event as unknown as object,
      },
    }),
  ])

  return {
    kind: 'applied',
    paymentId: existing.id,
    newStatus: targetStatus,
    purpose: existing.purpose,
  }
}
