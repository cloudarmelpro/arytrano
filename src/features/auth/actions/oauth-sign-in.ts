'use server'

import { cookies, headers } from 'next/headers'
import { z } from 'zod'
import { env } from '@/lib/env'
import { signIn } from '../auth'
import { SIGNUP_ROLE_COOKIE_NAME } from '../constants'
import { oauthProviderSchema, type OAuthProvider } from '../schemas'

/**
 * Intended role chosen on the sign-up page BEFORE the OAuth round-trip.
 * Stored briefly in a cookie so `events.createUser` (auth.ts) can pick it
 * up when the OAuth callback inserts the new User row.
 *
 * Without this, every Google/Facebook signup would default to STUDENT
 * (Prisma schema default), even when the user clicked "Propriétaire".
 */
const intendedRoleSchema = z.enum(['STUDENT', 'OWNER']).optional()

/**
 * Defence-in-depth same-origin check for the role-cookie write. Next.js
 * Server Actions already enforce same-origin on the action POST, but a
 * second explicit check here protects against future framework changes
 * and against a misconfigured reverse proxy stripping the Origin header.
 *
 * Allowed origins: the AUTH_URL host plus dev localhost.
 */
async function assertSameOrigin() {
  const h = await headers()
  const origin = h.get('origin')
  if (!origin) return // some legitimate clients omit it — Next's CSRF guard is the primary check
  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    throw new Error('Origine invalide.')
  }
  const expectedHost = new URL(env.AUTH_URL).host
  const isDev = env.NODE_ENV !== 'production'
  const okDev = isDev && (originHost === 'localhost:3000' || originHost.startsWith('127.0.0.1'))
  if (originHost !== expectedHost && !okDev) {
    throw new Error('Origine non autorisée.')
  }
}

export async function signInWithProvider(
  provider: OAuthProvider,
  intendedRole?: 'STUDENT' | 'OWNER',
) {
  await assertSameOrigin()
  const parsedProvider = oauthProviderSchema.parse(provider)
  const parsedRole = intendedRoleSchema.parse(intendedRole)

  if (parsedRole) {
    const c = await cookies()
    c.set(SIGNUP_ROLE_COOKIE_NAME, parsedRole, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      // 2 min is enough for the OAuth round-trip — shorter window limits
      // the cross-flow stale-cookie risk on shared devices.
      maxAge: 60 * 2,
      path: '/',
    })
  }

  await signIn(parsedProvider, { redirectTo: '/' })
}
