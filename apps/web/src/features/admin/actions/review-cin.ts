'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import { requireAdmin } from '../services/require-admin'
import { verifyOwnerCin, rejectOwnerCin } from '../services/review-cin'

type ReviewCinState = { ok: boolean; message?: string }

export async function approveOwnerCinAction(
  _prev: ReviewCinState,
  formData: FormData,
): Promise<ReviewCinState> {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }

  const ownerId = formData.get('ownerId')
  if (typeof ownerId !== 'string' || !ownerId) {
    return { ok: false, message: 'Propriétaire invalide' }
  }

  try {
    await verifyOwnerCin(admin.userId, ownerId)
    void writeAuditLog({
      adminId: admin.userId,
      action: 'cin.approve',
      targetType: 'User',
      targetId: ownerId,
    })
    revalidatePath('/admin/owner-verifications')
    revalidatePath('/admin')
    return { ok: true, message: 'CIN approuvée.' }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[approveOwnerCinAction]', err)
    return { ok: false, message: "Impossible d'approuver pour le moment." }
  }
}

export async function rejectOwnerCinAction(
  _prev: ReviewCinState,
  formData: FormData,
): Promise<ReviewCinState> {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }

  const ownerId = formData.get('ownerId')
  const reason = formData.get('reason')
  if (typeof ownerId !== 'string' || !ownerId) {
    return { ok: false, message: 'Propriétaire invalide' }
  }
  if (typeof reason !== 'string') {
    return { ok: false, message: 'Motif requis' }
  }

  try {
    await rejectOwnerCin(admin.userId, ownerId, reason)
    void writeAuditLog({
      adminId: admin.userId,
      action: 'cin.reject',
      targetType: 'User',
      targetId: ownerId,
      metadata: { reason: reason.slice(0, 200) },
    })
    revalidatePath('/admin/owner-verifications')
    revalidatePath('/admin')
    return { ok: true, message: 'CIN rejetée. Le propriétaire est notifié.' }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[rejectOwnerCinAction]', err)
    return { ok: false, message: 'Impossible de rejeter pour le moment.' }
  }
}
