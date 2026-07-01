'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { auth } from '../auth'
import {
  scheduleAccountDeletion,
  cancelAccountDeletion,
} from '../services/schedule-deletion'
import { deleteAccountSchema } from '../schemas'

type DeleteAccountActionState = {
  ok: boolean
  message?: string
  scheduledFor?: string
}

/**
 * TRU-19 — schedules the deletion 30 days in the future. Historically
 * this action hard-deleted immediately; now the user has a grace
 * window during which cancelAccountDeletionAction can revoke.
 */
export async function deleteAccountAction(
  _prev: DeleteAccountActionState,
  formData: FormData,
): Promise<DeleteAccountActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }
  try {
    deleteAccountSchema.parse({ confirm: formData.get('confirm') })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Confirmation invalide' }
    }
    throw err
  }
  try {
    const scheduledFor = await scheduleAccountDeletion(session.user.id)
    revalidatePath('/dashboard/settings')
    return { ok: true, scheduledFor: scheduledFor.toISOString() }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[delete-account]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}

export async function cancelAccountDeletionAction(
  _prev: DeleteAccountActionState,
): Promise<DeleteAccountActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }
  try {
    const canceled = await cancelAccountDeletion(session.user.id)
    if (!canceled) {
      return { ok: false, message: 'Aucune suppression en attente.' }
    }
    revalidatePath('/dashboard/settings')
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }
}
