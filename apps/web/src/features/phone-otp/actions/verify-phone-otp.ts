'use server'

import { ZodError } from 'zod'
import { verifyPhoneOtpSchema } from '../schemas'
import { verifyPhoneOtp } from '../services/verify-phone-otp'

export type VerifyPhoneOtpActionState = {
  ok: boolean
  message?: string
  attemptsLeft?: number
}

export async function verifyPhoneOtpAction(
  _prev: VerifyPhoneOtpActionState,
  formData: FormData,
): Promise<VerifyPhoneOtpActionState> {
  let input
  try {
    input = verifyPhoneOtpSchema.parse({
      phoneE164: formData.get('phoneE164'),
      code: formData.get('code'),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Saisie invalide.' }
    }
    throw err
  }

  const outcome = await verifyPhoneOtp(input)
  switch (outcome.kind) {
    case 'ok':
      return { ok: true }
    case 'no_pending_code':
      return {
        ok: false,
        message:
          'Aucun code valide pour ce numéro. Demande un nouveau code.',
      }
    case 'too_many_attempts':
      return {
        ok: false,
        message: 'Trop de tentatives. Demande un nouveau code.',
      }
    case 'invalid_code':
      return {
        ok: false,
        message:
          outcome.attemptsLeft > 0
            ? `Code incorrect (${outcome.attemptsLeft} essai${outcome.attemptsLeft > 1 ? 's' : ''} restant).`
            : 'Code incorrect. Demande un nouveau code.',
        attemptsLeft: outcome.attemptsLeft,
      }
  }
}
