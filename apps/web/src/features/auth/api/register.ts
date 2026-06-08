import 'server-only'
import { created, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { registerUser } from '../services/register-user'
import { recordLoginEvent } from '../services/record-login-event'
import { sendVerificationEmail } from '../services/send-verification-email'
import { signUpSchema } from '../schemas'

/**
 * POST /api/v1/auth/register — mobile
 *
 * Security audit C1 (2026-05-29) — mobile self-registration as OWNER
 * was a hole : any unauthenticated caller could POST `{role: "OWNER"}`,
 * skip email verification, and receive a JWT immediately. Two fixes :
 *   1. Force `role = STUDENT` regardless of what the body says. Owner
 *      promotion needs an authenticated dedicated upgrade endpoint, not
 *      a self-serve switch at registration time. (Web sign-up still
 *      allows OWNER because it's gated through the email-verify flow.)
 *   2. Do NOT issue tokens at registration. Email verification is the
 *      gate ; the client is expected to call /api/v1/auth/login after
 *      the user clicks the verify link in their inbox. Matches the
 *      web Credentials provider behaviour in `auth.ts`.
 *
 * Returns 201 with `{ user, requiresEmailVerification: true }` so the
 * mobile UI can route to a "check your inbox" screen instead of the
 * dashboard.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const { ipHash } = extractRequestInfo(req.headers)
  // Fail-CLOSED on null IP — bucket all unattributable signups together.
  const rl = await rateLimiters.register(ipHash ?? 'noip:register')
  if (!rl.success) {
    throw errors.rateLimited('Trop de comptes créés depuis cette adresse. Réessaie plus tard.')
  }

  const body = await req.json()
  const input = signUpSchema.parse(body)

  // SEC-C1 — strip any role override the caller tried to inject.
  const user = await registerUser({
    email: input.email,
    password: input.password,
    name: input.name,
    role: 'STUDENT',
  })

  // SEC-C1 — kick off the verification email. Failure here doesn't
  // block account creation : the user can request a re-send from the
  // sign-in screen if the first email lands in spam.
  await sendVerificationEmail(user.email).catch((err) =>
    console.error('[sendVerificationEmail register]', err),
  )

  await recordLoginEvent({
    userId: user.id,
    authMethod: 'MOBILE_JWT',
    request: req,
    isMobileApp: true,
  }).catch((err) => console.error('[recordLoginEvent register]', err))

  // NO tokens issued. Mobile must call /api/v1/auth/login after the
  // user verifies their email via the link.
  return created({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    requiresEmailVerification: true,
  })
})
