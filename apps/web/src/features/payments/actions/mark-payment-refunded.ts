'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import { requireAdmin } from '@/features/admin/server'
import { markPaymentRefunded } from '../services/mark-payment-refunded'

export type MarkPaymentRefundedActionState = {
  ok: boolean
  message?: string
}

/**
 * PAY-09 — admin marks REFUND_PENDING → REFUNDED after off-platform
 * money has moved. ADMIN-gated via the same DB-fresh requireAdmin
 * helper as the rest of the moderation surface (SEC-21).
 */
export async function markPaymentRefundedAction(
  _prev: MarkPaymentRefundedActionState,
  formData: FormData,
): Promise<MarkPaymentRefundedActionState> {
  let userId: string
  try {
    ;({ userId } = await requireAdmin())
  } catch {
    return { ok: false, message: 'Accès refusé.' }
  }

  const paymentId = String(formData.get('paymentId') ?? '')
  const note = String(formData.get('note') ?? '')
  if (!paymentId) return { ok: false, message: 'Identifiant manquant.' }

  try {
    const outcome = await markPaymentRefunded({
      paymentId,
      adminId: userId,
      note,
    })
    switch (outcome.kind) {
      case 'ok':
        void writeAuditLog({
          adminId: userId,
          action: 'payment.refund',
          targetType: 'Payment',
          targetId: paymentId,
          metadata: { note: note.slice(0, 100) },
        })
        revalidatePath('/admin/refunds')
        revalidatePath('/admin/revenue')
        return { ok: true }
      case 'not_found':
        return { ok: false, message: 'Paiement introuvable.' }
      case 'wrong_status':
        return {
          ok: false,
          message: `Statut ${outcome.status} — pas un refund en attente.`,
        }
    }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }
}
