'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import { requireAdmin } from '../services/require-admin'
import { suspendUser, reinstateUser } from '../services/suspend-user'

type SuspendUserActionState = { ok: boolean; message?: string }

export async function suspendUserAction(
  _prev: SuspendUserActionState,
  formData: FormData,
): Promise<SuspendUserActionState> {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }

  const userId = String(formData.get('userId') ?? '')
  const reason = String(formData.get('reason') ?? '')
  if (!userId) return { ok: false, message: 'Identifiant manquant.' }

  try {
    await suspendUser({ userId, reason, adminId: admin.userId })
    void writeAuditLog({
      adminId: admin.userId,
      action: 'user.suspend',
      targetType: 'User',
      targetId: userId,
      metadata: { reason: reason.slice(0, 200) },
    })
    revalidatePath(`/admin/users/${userId}`)
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }
}

export async function reinstateUserAction(
  _prev: SuspendUserActionState,
  formData: FormData,
): Promise<SuspendUserActionState> {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }
  const userId = String(formData.get('userId') ?? '')
  if (!userId) return { ok: false, message: 'Identifiant manquant.' }
  try {
    await reinstateUser({ userId, adminId: admin.userId })
    void writeAuditLog({
      adminId: admin.userId,
      action: 'user.reinstate',
      targetType: 'User',
      targetId: userId,
    })
    revalidatePath(`/admin/users/${userId}`)
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }
}
