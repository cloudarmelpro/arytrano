import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Aggregate PUBLISHED review ratings for a batch of listingIds.
 *
 * Used by every `PublicListingCard`-producing query so the public card
 * shows ★ rating + count. One `groupBy` round-trip per page rather than
 * N per-card lookups. Covered by the
 * `Review (listingId, status, createdAt)` composite index.
 *
 * Returns a map keyed by listingId. Listings with zero PUBLISHED
 * reviews are simply absent from the map — the caller defaults to
 * `{ avg: null, count: 0 }`.
 */
export type ListingRating = {
  avg: number | null
  count: number
}

export async function getRatingsForListings(
  listingIds: string[],
): Promise<Map<string, ListingRating>> {
  const result = new Map<string, ListingRating>()
  if (listingIds.length === 0) return result

  const agg = await prisma.review.groupBy({
    by: ['listingId'],
    where: { listingId: { in: listingIds }, status: 'PUBLISHED' },
    _avg: { rating: true },
    _count: { _all: true },
  })
  for (const a of agg) {
    result.set(a.listingId, { avg: a._avg.rating, count: a._count._all })
  }
  return result
}
