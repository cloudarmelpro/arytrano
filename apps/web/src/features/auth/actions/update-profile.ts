'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { auth } from '../auth'
import { updateProfile } from '../services/update-profile'
import { updateProfileSchema } from '../schemas'

type UpdateProfileActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

export async function updateProfileAction(
  _prev: UpdateProfileActionState,
  formData: FormData,
): Promise<UpdateProfileActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Tu dois être connecté pour modifier ton profil.' }
  }

  try {
    const input = updateProfileSchema.parse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      locale: formData.get('locale') || undefined,
    })
    await updateProfile(session.user.id, input)
    revalidatePath('/dashboard/profile')
    return { ok: true, message: 'Profil mis à jour.' }
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Champs invalides', fields: zodIssuesToFields(err) }
    }
    console.error('[update-profile] unexpected error:', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}
