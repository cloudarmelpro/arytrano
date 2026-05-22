import { NextResponse } from 'next/server'
import { consumeVerificationToken } from '@/features/auth/services/send-verification-email'

/**
 * Email verification consumer (T-verify-email).
 *
 * Reached from the link in the verification email. Single-use token
 * is validated + the user's `emailVerified` flips to now(). Always
 * redirects:
 *   - success      → /sign-in?verified=1 (sign-in form shows toast)
 *   - expired      → /auth-error?error=verification-expired
 *   - invalid      → /auth-error?error=verification-invalid
 *   - missing user → /auth-error?error=verification-invalid (don't
 *     differentiate; user-missing is a race we don't expose)
 *
 * `dynamic = 'force-dynamic'` because we read query params + always
 * issue a redirect, no caching makes sense here.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token') ?? ''
  const origin = url.origin

  const result = await consumeVerificationToken(token)

  if (result.ok) {
    return NextResponse.redirect(`${origin}/sign-in?verified=1`)
  }

  const errorCode =
    result.reason === 'expired' ? 'verification-expired' : 'verification-invalid'
  return NextResponse.redirect(`${origin}/auth-error?error=${errorCode}`)
}
