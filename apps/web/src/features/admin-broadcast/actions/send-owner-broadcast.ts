'use server'

import { ApiError } from '@/lib/api/errors'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import { requireAdmin } from '@/features/admin/server'
import { sendOwnerBroadcast } from '../services/send-owner-broadcast'

export type BroadcastActionState = {
  ok: boolean
  message?: string
  sent?: number
  scanned?: number
  failed?: number
}

export async function sendOwnerBroadcastAction(
  _prev: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }
  const subject = String(formData.get('subject') ?? '')
  const body = String(formData.get('body') ?? '')
  try {
    const result = await sendOwnerBroadcast({ subject, body })
    void writeAuditLog({
      adminId: admin.userId,
      action: 'admin.broadcast.send',
      targetType: 'AdminBroadcast',
      targetId: `${Date.now()}`,
      metadata: {
        subject: subject.slice(0, 100),
        sent: result.sent,
        failed: result.failed,
      },
    })
    return {
      ok: true,
      sent: result.sent,
      scanned: result.scanned,
      failed: result.failed,
    }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }
}
