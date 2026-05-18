'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { auth } from '../auth'
import { updateAvatar, removeAvatar } from '../services/update-avatar'

type AvatarActionState = { ok: boolean; message?: string; url?: string }

export async function uploadAvatarAction(
  _prev: AvatarActionState,
  formData: FormData,
): Promise<AvatarActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }
  const file = formData.get('avatar')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Choisis un fichier' }
  }
  try {
    const { url } = await updateAvatar(session.user.id, file)
    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/profile')
    return { ok: true, message: 'Photo mise à jour.', url }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[upload-avatar]', err)
    let reason: string
    if (err instanceof Error) {
      reason = err.message
    } else if (err && typeof err === 'object' && 'message' in err) {
      reason = String((err as { message: unknown }).message)
    } else if (typeof err === 'string') {
      reason = err
    } else {
      reason = 'erreur inconnue (voir log serveur)'
    }
    return {
      ok: false,
      message: `Échec de l'upload : ${reason.slice(0, 200)}`,
    }
  }
}

export async function removeAvatarAction(): Promise<AvatarActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }
  try {
    await removeAvatar(session.user.id)
    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/profile')
    return { ok: true, message: 'Photo supprimée.' }
  } catch (err) {
    console.error('[remove-avatar]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}
