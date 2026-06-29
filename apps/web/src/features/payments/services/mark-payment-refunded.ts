import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

export type MarkRefundedOutcome =
  | { kind: 'ok'; paymentId: string }
  | { kind: 'not_found' }
  | { kind: 'wrong_status'; status: string }

/**
 * PAY-09 — push a Payment row from REFUND_PENDING to REFUNDED after
 * the admin has confirmed the off-platform refund (GoalPay has no
 * refund API). The `note` field captures the proof: typically the
 * GoalPay support ticket id + the new transaction id of the refund
 * leg, so disputes have a chain back to the money movement.
 *
 * Conditional updateMany guarantees we never resurrect a row that
 * was already flipped by a concurrent admin.
 */
export async function markPaymentRefunded(input: {
  paymentId: string
  adminId: string
  note: string
}): Promise<MarkRefundedOutcome> {
  if (input.note.trim().length < 4) {
    throw errors.validation('Note de remboursement requise (4 caractères min)')
  }

  const existing = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    select: { id: true, status: true },
  })
  if (!existing) return { kind: 'not_found' }
  if (existing.status !== 'REFUND_PENDING') {
    return { kind: 'wrong_status', status: existing.status }
  }

  const result = await prisma.payment.updateMany({
    where: { id: input.paymentId, status: 'REFUND_PENDING' },
    data: {
      status: 'REFUNDED',
      refundedAt: new Date(),
      refundedById: input.adminId,
      refundNote: input.note.trim().slice(0, 500),
    },
  })
  if (result.count === 0) {
    // Lost the race to another admin who just refunded.
    return { kind: 'wrong_status', status: 'REFUNDED' }
  }
  return { kind: 'ok', paymentId: input.paymentId }
}
