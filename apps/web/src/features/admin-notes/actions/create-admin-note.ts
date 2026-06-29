'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import { requireAdmin } from '@/features/admin/server'
import { createAdminNoteSchema } from '../schemas'
import { createAdminNote } from '../services/admin-notes-service'

export type CreateAdminNoteActionState = {
  ok: boolean
  message?: string
}

export async function createAdminNoteAction(
  _prev: CreateAdminNoteActionState,
  formData: FormData,
): Promise<CreateAdminNoteActionState> {
  let userId: string
  try {
    ;({ userId } = await requireAdmin())
  } catch {
    return { ok: false, message: 'Accès refusé.' }
  }

  let input
  try {
    input = createAdminNoteSchema.parse({
      targetType: formData.get('targetType'),
      targetId: formData.get('targetId'),
      body: formData.get('body'),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Note invalide.' }
    }
    throw err
  }

  try {
    const { id } = await createAdminNote(input, userId)
    void writeAuditLog({
      adminId: userId,
      action: 'admin-note.create',
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: { noteId: id },
    })
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }

  // Revalidate both detail surfaces — cheap, the routes only render on demand.
  const path =
    input.targetType === 'User'
      ? `/admin/users/${input.targetId}`
      : `/admin/listings/${input.targetId}`
  revalidatePath(path)
  return { ok: true }
}
