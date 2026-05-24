import 'server-only'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { errors } from '@/lib/api/errors'
import { consumeResetToken } from './request-password-reset'

/**
 * Validate a reset token, hash the new password, persist it,
 * and bump `tokenVersion` so all existing JWT mobile tokens are revoked.
 * Throws ApiError(400) if the token is invalid / expired / already used.
 */
export async function resetPassword(input: { token: string; password: string }) {
  const consumed = await consumeResetToken(input.token)
  if (!consumed) {
    throw errors.validation('Lien invalide ou expiré. Demande un nouveau lien.')
  }
  const passwordHash = await hashPassword(input.password)
  await prisma.user.update({
    where: { id: consumed.userId },
    data: { passwordHash, tokenVersion: { increment: 1 } },
  })
  return { userId: consumed.userId, email: consumed.email }
}
