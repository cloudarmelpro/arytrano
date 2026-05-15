import 'server-only'
import { created, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { signTokenPair } from '@/lib/auth/jwt'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { registerUser } from '../services/register-user'
import { recordLoginEvent } from '../services/record-login-event'
import { signUpSchema } from '../schemas'

/** POST /api/v1/auth/register — mobile */
export const POST = withErrorHandling(async (req: Request) => {
  const { ipHash } = extractRequestInfo(req.headers)
  // Fail-CLOSED on null IP — bucket all unattributable signups together.
  const rl = await rateLimiters.register(ipHash ?? 'noip:register')
  if (!rl.success) {
    throw errors.rateLimited('Trop de comptes créés depuis cette adresse. Réessaie plus tard.')
  }

  const body = await req.json()
  const input = signUpSchema.parse(body)

  const user = await registerUser(input)
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
  }).catch((err) => console.error('[recordLoginEvent register]', err))

  return created({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    tokens,
  })
})
