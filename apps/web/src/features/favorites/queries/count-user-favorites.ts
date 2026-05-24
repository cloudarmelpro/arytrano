import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Counts favorites whose target listing is still PUBLISHED — favorites on
 * suspended/deleted listings are hidden from the user's view so they
 * shouldn't inflate this badge either.
 */
export async function countUserPublishedFavorites(userId: string): Promise<number> {
  return prisma.favorite.count({
    where: { userId, listing: { status: 'PUBLISHED' } },
  })
}
