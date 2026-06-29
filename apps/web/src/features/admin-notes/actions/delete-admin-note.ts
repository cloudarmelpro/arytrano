'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import { requireAdmin } from '@/features/admin/server'
import { deleteAdminNote } from '../services/admin-notes-service'

export type DeleteAdminNoteActionState = {
  ok: boolean
  message?: string
}

export async function deleteAdminNoteAction(
  noteId: string,
  /** Revalidation path — the panel knows the surface it lives on. */
  revalidate: string,
): Promise<DeleteAdminNoteActionState> {
  let userId: string
  try {
    ;({ userId } = await requireAdmin())
  } catch {
    return { ok: false, message: 'Accès refusé.' }
  }

  try {
    await deleteAdminNote(noteId, userId)
    void writeAuditLog({
      adminId: userId,
      action: 'admin-note.delete',
      targetType: 'AdminNote',
      targetId: noteId,
    })
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }
  revalidatePath(revalidate)
  return { ok: true }
}
