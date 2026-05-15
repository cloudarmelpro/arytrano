'use server'

import { cookies } from 'next/headers'
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

export async function signInWithProvider(
  provider: OAuthProvider,
  intendedRole?: 'STUDENT' | 'OWNER',
) {
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
