'use server'

import { headers } from 'next/headers'
import { ZodError } from 'zod'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { requestPasswordReset } from '../services/request-password-reset'
import { forgotPasswordSchema } from '../schemas'

type ForgotPasswordActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

export async function forgotPasswordAction(
  _prev: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  let email: string
  try {
    const parsed = forgotPasswordSchema.parse({
      email: formData.get('email'),
    })
    email = parsed.email
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Email invalide', fields: zodIssuesToFields(err) }
    }
    throw err
  }

  // Rate limit: 3 / hour / email + 10 / hour / IP (web only — mobile API has its own check)
  // Fail-CLOSED on null IP — bucket unattributable resets together.
  const h = await headers()
  const { ipHash } = extractRequestInfo(h)
  const rl = await rateLimiters.forgotPassword(email, ipHash ?? 'noip:forgot')
  if (!rl.success) {
    return {
      ok: false,
      message: 'Trop de demandes de réinitialisation. Réessaie dans une heure.',
    }
  }

  try {
    await requestPasswordReset(email)
    return { ok: true, message: 'Si un compte existe pour cet email, un lien vient d\'être envoyé.' }
  } catch (err) {
    console.error('[forgot-password] unexpected error:', err)
    return { ok: false, message: 'Une erreur est survenue. Réessaie dans un instant.' }
  }
}
