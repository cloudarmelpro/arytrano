import 'server-only'
import { prisma } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { errors } from '@/lib/api/errors'

/**
 * Set a password for a user who has no password yet (e.g. OAuth-only signup).
 * Throws ApiError(409) if the user already has a password — use changePassword instead.
 */
export async function setPassword(userId: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  })
  if (!user) throw errors.notFound('User not found')
  if (user.passwordHash) {
    throw errors.conflict('Tu as déjà un mot de passe. Utilise "Modifier" plutôt qu\'"Ajouter".')
  }
  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, tokenVersion: { increment: 1 } },
  })
}

/**
 * Change an existing password. Verifies the current password first.
 * Bumps `tokenVersion` so existing JWT mobile tokens are revoked.
 * Throws ApiError(401) if currentPassword doesn't match.
 */
export async function changePassword(
  userId: string,
  input: { currentPassword: string; newPassword: string },
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  })
  if (!user || !user.passwordHash) {
    throw errors.validation('Aucun mot de passe défini. Utilise "Ajouter un mot de passe".')
  }
  const ok = await verifyPassword(input.currentPassword, user.passwordHash)
  if (!ok) throw errors.unauthorized('Mot de passe actuel incorrect')

  const passwordHash = await hashPassword(input.newPassword)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, tokenVersion: { increment: 1 } },
  })
}
