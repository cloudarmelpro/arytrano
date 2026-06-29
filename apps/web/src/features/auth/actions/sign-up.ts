'use server'

import { redirect } from 'next/navigation'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { verifyRecaptchaToken } from '@/lib/security/recaptcha'
import { registerUser } from '../services/register-user'
import { sendVerificationEmail } from '../services/send-verification-email'
import { signUpSchema } from '../schemas'

type SignUpActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

/**
 * Strict email verification (no auto sign-in). Flow :
 *   1. Validate input via Zod
 *   2. Create the User row (emailVerified stays null)
 *   3. Send the verification email (24h TTL token, single-use)
 *   4. Redirect to /verify-email?email=<...> — the page tells the
 *      user to check their inbox and exposes a "resend" button
 *
 * Credentials sign-in is blocked elsewhere (auth callback) until the
 * email is verified, so the user CAN'T just hit /sign-in to bypass.
 *
 * The email send is fail-soft : if SMTP is down, the user is still
 * created but the redirect to /verify-email still happens. The
 * resend button gives them a recovery path.
 */
export async function signUpAction(
  _prev: SignUpActionState,
  formData: FormData,
): Promise<SignUpActionState> {
  let input
  try {
    input = signUpSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name') || undefined,
      role: formData.get('role') || 'STUDENT',
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Champs invalides', fields: zodIssuesToFields(err) }
    }
    throw err
  }

  // TRU-17 — score-based bot gate. Short-circuits to ok when env keys
  // are unset (dev / preview). Use a non-generic message on rejection
  // so we can spot real bot traffic vs unrelated network failures.
  const recaptchaToken = formData.get('recaptchaToken')
  const recaptcha = await verifyRecaptchaToken(
    typeof recaptchaToken === 'string' ? recaptchaToken : null,
    'sign_up',
  )
  if (!recaptcha.ok) {
    return {
      ok: false,
      message:
        'Vérification anti-robot échouée — rafraîchis la page et réessaie.',
    }
  }

  try {
    await registerUser(input)
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, message: err.message }
    }
    throw err
  }

  // Fire the verification email. Don't block on failure — user can
  // hit the resend button from /verify-email if it didn't arrive.
  try {
    await sendVerificationEmail(input.email)
  } catch {
    // Swallowed — page will offer a resend button.
  }

  redirect(`/verify-email?email=${encodeURIComponent(input.email)}`)
}
