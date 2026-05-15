'use server'

import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { signIn } from '../auth'
import { resetPassword } from '../services/reset-password'
import { resetPasswordSchema } from '../schemas'

export type ResetPasswordActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

export async function resetPasswordAction(
  _prev: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> {
  let input
  try {
    input = resetPasswordSchema.parse({
      token: formData.get('token'),
      password: formData.get('password'),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Champs invalides', fields: zodIssuesToFields(err) }
    }
    throw err
  }

  let userEmail: string
  try {
    const res = await resetPassword(input)
    userEmail = res.email
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, message: err.message }
    }
    throw err
  }

  await signIn('credentials', {
    email: userEmail,
    password: input.password,
    redirectTo: '/',
  })

  return { ok: true }
}
