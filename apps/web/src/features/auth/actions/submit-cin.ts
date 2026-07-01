'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { auth } from '../auth'
import {
  submitCinForVerification,
  submitSelfieForVerification,
} from '../services/submit-cin'

type SubmitCinState = {
  ok: boolean
  message?: string
  resubmitted?: boolean
}

/**
 * Owner CIN upload Server Action (T-038). Server Action — Authn guard
 * mandatory (signed-in owner only). The encrypted bytes never leave the
 * server: `submitCinForVerification` does the AES-GCM encryption +
 * Prisma upsert in-process.
 */
export async function submitCinAction(
  _prev: SubmitCinState,
  formData: FormData,
): Promise<SubmitCinState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise' }
  }

  const file = formData.get('cin')
  if (!(file instanceof File)) {
    return { ok: false, message: 'Aucun fichier reçu' }
  }

  try {
    const result = await submitCinForVerification(session.user.id, file)
    revalidatePath('/dashboard/verify-owner')
    revalidatePath('/dashboard/profile')
    return {
      ok: true,
      resubmitted: result.resubmitted,
      message: result.resubmitted
        ? 'CIN renvoyée — un admin va la revoir.'
        : 'CIN reçue — un admin va la vérifier.',
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, message: err.message }
    }
    console.error('[submitCinAction]', err)
    return {
      ok: false,
      message: "Impossible d'enregistrer le document pour le moment.",
    }
  }
}

/**
 * TRU-02 — mirror action for the selfie. Same auth guard, same
 * revalidate targets. Fires after the CIN action so the OwnerProfile
 * row already exists.
 */
export async function submitSelfieAction(
  _prev: SubmitCinState,
  formData: FormData,
): Promise<SubmitCinState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise' }
  }
  const file = formData.get('selfie')
  if (!(file instanceof File)) {
    return { ok: false, message: 'Aucun fichier reçu' }
  }
  try {
    const result = await submitSelfieForVerification(session.user.id, file)
    revalidatePath('/dashboard/verify-owner')
    revalidatePath('/dashboard/profile')
    return {
      ok: true,
      resubmitted: result.resubmitted,
      message: result.resubmitted
        ? 'Selfie renvoyé — un admin va le revoir.'
        : 'Selfie reçu — un admin va vérifier ton identité.',
    }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[submitSelfieAction]', err)
    return { ok: false, message: "Impossible d'enregistrer le selfie pour le moment." }
  }
}
