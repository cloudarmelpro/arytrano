'use server'

import { headers } from 'next/headers'
import { ZodError } from 'zod'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { requestPhoneOtpSchema } from '../schemas'
import { requestPhoneOtp } from '../services/request-phone-otp'

export type RequestPhoneOtpActionState = {
  ok: boolean
  message?: string
  /** ISO string the client uses to render a "expires in" timer. */
  expiresAtIso?: string
  resent?: boolean
}

/**
 * T-002 — Server Action wrapping `requestPhoneOtp`. Called from the
 * 2-step lead dialog after the visitor types their phone number.
 * Anonymous-friendly (no auth gate).
 */
export async function requestPhoneOtpAction(
  _prev: RequestPhoneOtpActionState,
  formData: FormData,
): Promise<RequestPhoneOtpActionState> {
  let input
  try {
    input = requestPhoneOtpSchema.parse({
      phoneE164: formData.get('phoneE164'),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Numéro invalide.' }
    }
    throw err
  }

  const h = await headers()
  const { ipHash } = extractRequestInfo(h)

  const outcome = await requestPhoneOtp(input, { ipHash })
  switch (outcome.kind) {
    case 'ok':
      return {
        ok: true,
        expiresAtIso: outcome.expiresAt.toISOString(),
        resent: outcome.resent,
      }
    case 'rate_limited':
      return {
        ok: false,
        message: 'Trop de codes demandés. Réessaie dans une heure.',
      }
    case 'sms_failed':
      return {
        ok: false,
        message:
          'Impossible d’envoyer le SMS pour le moment. Vérifie ton numéro ou réessaie plus tard.',
      }
  }
}
