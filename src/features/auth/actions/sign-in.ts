'use server'

import { AuthError } from 'next-auth'
import { ZodError } from 'zod'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { signIn } from '../auth'
import { loginSchema } from '../schemas'

type SignInActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
  /**
   * True when password was accepted but the user has 2FA enabled and no
   * code was provided yet. The form switches to a TOTP / recovery-code
   * prompt and re-submits with `totpCode` populated.
   */
  needTotp?: boolean
}

export async function signInAction(
  _prev: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  let input
  try {
    input = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      // formData.get returns null when the field is absent (step-1 submit
      // has no totpCode field yet) — zod's .optional() rejects null, so
      // coerce to undefined here.
      totpCode: formData.get('totpCode') ?? undefined,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Champs invalides', fields: zodIssuesToFields(err) }
    }
    throw err
  }

  // Pre-flight: verify email+password and check whether the account has 2FA
  // enabled. We do NOT verify the TOTP code here — that happens once inside
  // `authorize()` so a recovery code is consumed exactly once per login.
  //
  // Branching on totpEnabledAt before password verification would enable
  // account enumeration ("which emails have 2FA?"), so the password check
  // must succeed first.
  const preflight = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      passwordHash: true,
      status: true,
      totpEnabledAt: true,
    },
  })
  if (
    !preflight?.passwordHash ||
    preflight.status !== 'ACTIVE' ||
    !(await verifyPassword(input.password, preflight.passwordHash))
  ) {
    return { ok: false, message: 'Email ou mot de passe incorrect' }
  }

  if (preflight.totpEnabledAt && !input.totpCode) {
    return { ok: false, needTotp: true }
  }

  try {
    await signIn('credentials', {
      email: input.email,
      password: input.password,
      totpCode: input.totpCode ?? '',
      redirectTo: '/',
    })
  } catch (err) {
    if (err instanceof AuthError) {
      // At this point password is known good — an AuthError on credentials
      // here means the TOTP code didn't verify. Tell the form to stay on
      // the step-2 prompt with a code-specific message.
      if (preflight.totpEnabledAt) {
        return { ok: false, needTotp: true, message: 'Code 2FA invalide' }
      }
      return { ok: false, message: 'Email ou mot de passe incorrect' }
    }
    throw err
  }

  return { ok: true }
}
