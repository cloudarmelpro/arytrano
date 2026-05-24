'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { auth } from '../auth'
import { setPassword, changePassword } from '../services/set-password'
import { setPasswordSchema, changePasswordSchema } from '../schemas'

type PasswordActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

export async function setPasswordAction(
  _prev: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }
  try {
    const { password } = setPasswordSchema.parse({ password: formData.get('password') })
    await setPassword(session.user.id, password)
    revalidatePath('/dashboard/settings')
    return {
      ok: true,
      message: 'Mot de passe ajouté. Tu peux maintenant te connecter avec ton email + mot de passe.',
    }
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Champs invalides', fields: zodIssuesToFields(err) }
    }
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[set-password]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}

export async function changePasswordAction(
  _prev: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }
  try {
    const input = changePasswordSchema.parse({
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
    })
    await changePassword(session.user.id, input)
    revalidatePath('/dashboard/settings')
    return { ok: true, message: 'Mot de passe modifié.' }
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Champs invalides', fields: zodIssuesToFields(err) }
    }
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[change-password]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}
