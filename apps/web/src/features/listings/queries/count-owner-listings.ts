import 'server-only'
import { prisma } from '@/lib/db'

export type OwnerListingCounts = {
  total: number
  published: number
}

/**
 * Two scalar counts the owner dashboard uses to show "X annonces · Y publiées".
 * Skips DELETED. Single round-trip via Promise.all.
 */
export async function countOwnerListings(
  ownerId: string,
): Promise<OwnerListingCounts> {
  const [total, published] = await Promise.all([
    prisma.listing.count({
      where: { ownerId, status: { not: 'DELETED' } },
    }),
    prisma.listing.count({
      where: { ownerId, status: 'PUBLISHED' },
    }),
  ])
  return { total, published }
}
