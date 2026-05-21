import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Remove every favorite belonging to a user. Returns the count of
 * rows deleted (useful for the toast message). Idempotent: zero
 * favorites → returns 0, no error.
 */
export async function removeAllFavorites(userId: string): Promise<number> {
  const result = await prisma.favorite.deleteMany({
    where: { userId },
  })
  return result.count
}
