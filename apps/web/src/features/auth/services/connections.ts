import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

export type ConnectionSummary = {
  hasPassword: boolean
  oauth: Array<{ provider: string; providerAccountId: string }>
}

export async function listConnections(userId: string): Promise<ConnectionSummary> {
  const [user, accounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    }),
    prisma.account.findMany({
      where: { userId },
      select: { provider: true, providerAccountId: true },
    }),
  ])
  if (!user) throw errors.notFound('User not found')
  return {
    hasPassword: !!user.passwordHash,
    oauth: accounts.map((a) => ({ provider: a.provider, providerAccountId: a.providerAccountId })),
  }
}

/**
 * How many independent ways can this user sign in?
 * Used to refuse the last-method removal.
 */
export async function countAuthMethods(userId: string): Promise<number> {
  const summary = await listConnections(userId)
  return (summary.hasPassword ? 1 : 0) + summary.oauth.length
}
