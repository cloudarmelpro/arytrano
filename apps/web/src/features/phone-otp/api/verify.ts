import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { hashPhone } from '@/lib/auth/hash-phone'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { verifyPhoneOtpSchema } from '../schemas'
import { verifyPhoneOtp } from '../services/verify-phone-otp'

/**
 * T-002 — POST /api/v1/phone/verify-otp
 *
 * Anonymous endpoint. Body : `{ phoneE164, code }`. Returns 200 OK
 * on success — the lead-submit endpoint then reads the recent
 * verification on its own (no token returned here).
 */
export const makeVerifyPhoneOtpHandler = () =>
  withErrorHandling(async (req: Request) => {
    const body = await req.json()
    const input = verifyPhoneOtpSchema.parse(body)

    // Audit fix 2026-06-12 — rate-limit the verify path (phone + ip)
    // so an attacker cannot brute-burn the 3-attempts row cap.
    const { ipHash } = extractRequestInfo(req.headers)
    const limited = await rateLimiters.phoneOtpVerify(
      hashPhone(input.phoneE164),
      ipHash,
    )
    if (!limited.success) {
      throw errors.rateLimited('Trop d’essais. Réessaie dans une heure.')
    }

    const outcome = await verifyPhoneOtp(input)
    switch (outcome.kind) {
      case 'ok':
        return ok({ verified: true })
      case 'no_pending_code':
        throw errors.notFound('Aucun code en attente pour ce numéro.')
      case 'too_many_attempts':
        throw errors.conflict('Trop de tentatives.')
      case 'invalid_code':
        throw errors.conflict(
          `Code incorrect (${outcome.attemptsLeft} essai${outcome.attemptsLeft > 1 ? 's' : ''} restant).`,
        )
    }
  })
