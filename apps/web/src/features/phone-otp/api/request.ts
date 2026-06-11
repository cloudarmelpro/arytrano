import 'server-only'
import { created, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { requestPhoneOtpSchema } from '../schemas'
import { requestPhoneOtp } from '../services/request-phone-otp'

/**
 * T-002 — POST /api/v1/phone/request-otp
 *
 * Anonymous endpoint (no bearer required). Body : `{ phoneE164 }`.
 * Mirrors the Server Action one-for-one so mobile + web share the
 * same surface.
 */
export const makeRequestPhoneOtpHandler = () =>
  withErrorHandling(async (req: Request) => {
    const body = await req.json()
    const input = requestPhoneOtpSchema.parse(body)
    const { ipHash } = extractRequestInfo(req.headers)
    const outcome = await requestPhoneOtp(input, { ipHash })
    switch (outcome.kind) {
      case 'ok':
        return created({
          expiresAt: outcome.expiresAt.toISOString(),
          resent: outcome.resent,
        })
      case 'rate_limited':
        throw errors.rateLimited('Trop de codes demandés.')
      case 'sms_failed':
        throw errors.conflict(`SMS provider failure: ${outcome.code}`)
    }
  })
