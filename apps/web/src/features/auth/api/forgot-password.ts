import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { requestPasswordReset } from '../services/request-password-reset'
import { forgotPasswordSchema } from '../schemas'

/** POST /api/v1/auth/forgot-password — mobile */
export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json()
  const { email } = forgotPasswordSchema.parse(body)

  const { ipHash } = extractRequestInfo(req.headers)
  // Fail-CLOSED on null IP — bucket unattributable resets together.
  const rl = await rateLimiters.forgotPassword(email, ipHash ?? 'noip:forgot')
  if (!rl.success) {
    throw errors.rateLimited(
      'Trop de demandes de réinitialisation. Réessaie dans une heure.',
    )
  }

  await requestPasswordReset(email)
  // Always 200 with a generic message — anti-enumeration.
  return ok({ sent: true })
})
