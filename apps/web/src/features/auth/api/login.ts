import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { signTokenPair } from '@/lib/auth/jwt'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { authenticateWithPassword } from '../services/authenticate'
import { recordLoginEvent } from '../services/record-login-event'
import { loginSchema } from '../schemas'

/** POST /api/v1/auth/login — mobile */
export const POST = withErrorHandling(async (req: Request) => {
  const { ipHash } = extractRequestInfo(req.headers)
  // Fail-CLOSED on null IP — bucket all unattributable attempts together
  // so missing X-Forwarded-For headers can't be used to bypass the cap.
  const rl = await rateLimiters.login(ipHash ?? 'noip:login')
  if (!rl.success) {
    throw errors.rateLimited('Trop de tentatives. Réessaie dans quelques minutes.')
  }

  const body = await req.json()
  const input = loginSchema.parse(body)

  const user = await authenticateWithPassword(input)
  const tokens = await signTokenPair({
    sub: user.id,
    role: user.role,
    ver: user.tokenVersion,
  })

  await recordLoginEvent({
    userId: user.id,
    authMethod: 'MOBILE_JWT',
    request: req,
    isMobileApp: true,
  }).catch((err) => console.error('[recordLoginEvent mobile]', err))

  return ok({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    tokens,
  })
})
