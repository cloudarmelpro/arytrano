import 'server-only'
import { z } from 'zod'
import { created, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { registerUser } from '../services/register-user'
import { recordLoginEvent } from '../services/record-login-event'
import { sendVerificationEmail } from '../services/send-verification-email'

/**
 * Mobile-only sign-up schema — DELIBERATELY omits the `role` field
 * the web `signUpSchema` accepts. Mobile self-registration may only
 * create STUDENT accounts; OWNER promotion needs a dedicated
 * authenticated upgrade endpoint, not a self-serve switch at signup.
 *
 * Defense-in-depth (round 2, 2026-06-08): the registerUser() call
 * below also hard-codes `role: 'STUDENT'`, but parsing through a
 * schema that has no `role` field means an attacker's `{role:"OWNER"}`
 * is dropped at the Zod boundary — no chance of a future maintainer
 * accidentally spreading `input` into the service call.
 */
const mobileRegisterSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Au moins 8 caractères')
    .max(128, '128 caractères maximum'),
  name: z.string().min(2, 'Au moins 2 caractères').max(80).optional(),
})

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
  const input = mobileRegisterSchema.parse(body)

  // SEC-C1 — `role` is forced STUDENT here AND there's no `role` field
  // on `mobileRegisterSchema` to begin with (double belt-and-braces).
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
