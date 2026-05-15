'use server'

import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { signIn } from '../auth'
import { registerUser } from '../services/register-user'
import { signUpSchema } from '../schemas'

export type SignUpActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

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

  try {
    await registerUser(input)
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, message: err.message }
    }
    throw err
  }

  await signIn('credentials', {
    email: input.email,
    password: input.password,
    redirectTo: '/',
  })

  return { ok: true }
}
