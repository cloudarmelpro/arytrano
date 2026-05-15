'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { auth } from '../auth'
import { unlinkOAuth } from '../services/unlink-oauth'
import { oauthProviderSchema } from '../schemas'

export type UnlinkActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

export async function unlinkOAuthAction(
  _prev: UnlinkActionState,
  formData: FormData,
): Promise<UnlinkActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }

  let provider
  try {
    provider = oauthProviderSchema.parse(formData.get('provider'))
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Provider invalide', fields: zodIssuesToFields(err) }
    }
    throw err
  }

  try {
    await unlinkOAuth(session.user.id, provider)
    revalidatePath('/dashboard/settings')
    return { ok: true, message: `Compte ${provider} délié.` }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[unlink-oauth]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}
