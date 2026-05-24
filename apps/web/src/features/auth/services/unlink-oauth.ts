import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { oauthProviderSchema } from '../schemas'
import { countAuthMethods } from './connections'

export async function unlinkOAuth(userId: string, providerInput: string) {
  const parsed = oauthProviderSchema.safeParse(providerInput)
  if (!parsed.success) {
    throw errors.validation(`Provider non supporté: ${providerInput}`)
  }
  const provider = parsed.data

  // Safety: prevent locking the user out by removing their only auth method.
  const methods = await countAuthMethods(userId)
  if (methods <= 1) {
    throw errors.conflict(
      'Impossible de délier ta dernière méthode de connexion. Ajoute un mot de passe d\'abord.',
    )
  }

  const result = await prisma.account.deleteMany({
    where: { userId, provider },
  })
  if (result.count === 0) {
    throw errors.notFound(`Aucun compte ${provider} lié`)
  }

  // Bump tokenVersion to revoke any JWT issued while this account was linked.
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  })
}
