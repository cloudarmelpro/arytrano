import 'server-only'
import { prisma } from '@/lib/db'
import { verifyJwt, signTokenPair } from '@/lib/auth/jwt'
import { errors } from '@/lib/api/errors'

/**
 * Exchange a refresh token for a fresh access + refresh token pair.
 * Verifies the user still exists, is ACTIVE, and the refresh token's
 * `ver` claim still matches DB tokenVersion (revoked after credential
 * rotation).
 */
export async function refreshTokens(refreshToken: string) {
  let payload
  try {
    payload = await verifyJwt(refreshToken, 'refresh')
  } catch {
    throw errors.unauthorized('Invalid or expired refresh token')
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, status: true, role: true, tokenVersion: true },
  })
  if (!user || user.status !== 'ACTIVE') {
    throw errors.unauthorized('User no longer active')
  }
  if (user.tokenVersion !== payload.ver) {
    throw errors.unauthorized('Refresh token revoked. Sign in again.')
  }

  return signTokenPair({ sub: user.id, role: user.role, ver: user.tokenVersion })
}
