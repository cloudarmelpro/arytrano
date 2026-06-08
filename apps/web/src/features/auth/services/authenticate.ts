import 'server-only'
import type { UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { errors } from '@/lib/api/errors'
import { verifyTotpForSignIn } from './totp'

export type AuthenticatedUser = {
  id: string
  email: string
  name: string | null
  role: UserRole
  tokenVersion: number
}

/**
 * Verify email/password (+ optional TOTP) against the DB. Used by:
 *   - the mobile REST /api/v1/auth/login endpoint
 *   - the NextAuth Credentials provider (web)
 *
 * When the user has 2FA enabled, the caller MUST provide `totpCode` —
 * absence is signaled with `errors.totpRequired()` (code `totp_required`,
 * status 401) so the client can branch to the step-2 prompt.
 */
export async function authenticateWithPassword(input: {
  email: string
  password: string
  totpCode?: string
}): Promise<AuthenticatedUser> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      status: true,
      tokenVersion: true,
      totpEnabledAt: true,
      emailVerified: true,
    },
  })

  if (!user || !user.passwordHash) {
    throw errors.unauthorized('Email ou mot de passe incorrect')
  }
  if (user.status !== 'ACTIVE') {
    throw errors.forbidden('Compte suspendu ou supprimé')
  }

  const ok = await verifyPassword(input.password, user.passwordHash)
  if (!ok) {
    throw errors.unauthorized('Email ou mot de passe incorrect')
  }

  // SEC-C1 (2026-05-29) — REST path was not enforcing email verification
  // even though the web Credentials provider does (see auth.ts:98).
  // Block authentication entirely if the email is not verified — the
  // mobile UI surfaces this as "Vérifie ton email avant de te connecter".
  if (user.emailVerified === null) {
    throw errors.forbidden('Vérifie ton email avant de te connecter')
  }

  if (user.totpEnabledAt) {
    if (!input.totpCode) {
      throw errors.totpRequired('Code 2FA requis')
    }
    const totpOk = await verifyTotpForSignIn({ userId: user.id, code: input.totpCode })
    if (!totpOk) {
      throw errors.unauthorized('Code 2FA invalide')
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tokenVersion: user.tokenVersion,
  }
}
