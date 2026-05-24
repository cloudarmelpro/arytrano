import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

export type LandingStats = {
  publishedListings: number
  neighborhoods: number
  verifiedOwners: number
}

/**
 * Cached for 5 minutes — these are aggregate counters (PUBLISHED
 * listings, neighborhoods, verified owners) that change slowly. Every
 * landing pageload used to fire 3 COUNT queries; this drops it to one
 * lookup per 5 min window per region.
 *
 * On mutation (new listing published, owner verified) the stats can be
 * up to 5 min stale — acceptable for a homepage social-proof line.
 * Switch to `revalidateTag('landing-stats')` on those mutations if
 * exact freshness becomes a requirement.
 */
export const getLandingStats = unstable_cache(
  async (): Promise<LandingStats> => {
    const [publishedListings, neighborhoods, verifiedOwners] = await Promise.all([
      prisma.listing.count({ where: { status: 'PUBLISHED' } }),
      prisma.neighborhood.count(),
      prisma.ownerProfile.count({ where: { verifiedAt: { not: null } } }),
    ])
    return { publishedListings, neighborhoods, verifiedOwners }
  },
  ['landing-stats-v1'],
  { revalidate: 300, tags: ['landing-stats'] },
)
