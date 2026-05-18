'use server'

import { redirect } from 'next/navigation'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { auth, signOut } from '../auth'
import { deleteAccount } from '../services/delete-account'
import { deleteAccountSchema } from '../schemas'

type DeleteAccountActionState = { ok: boolean; message?: string }

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
    await deleteAccount(session.user.id)
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[delete-account]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
  await signOut({ redirect: false })
  redirect('/?goodbye=1')
}
