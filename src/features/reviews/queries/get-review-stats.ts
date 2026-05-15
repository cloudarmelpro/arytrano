import 'server-only'
import { prisma } from '@/lib/db'

export type ReviewStats = {
  count: number
  /** Average rounded to 1 decimal, or null when there are no reviews yet. */
  average: number | null
}

/**
 * Aggregate stats for the title block (★ 4.7 · 23 avis).
 * Cheap query — Postgres aggregates on the indexed `(listingId, status)`.
 */
export async function getReviewStats(listingId: string): Promise<ReviewStats> {
  const result = await prisma.review.aggregate({
    where: { listingId, status: 'PUBLISHED' },
    _count: { _all: true },
    _avg: { rating: true },
  })
  const count = result._count._all
  const avg = result._avg.rating
  return {
    count,
    average: avg !== null ? Math.round(avg * 10) / 10 : null,
  }
}

/**
 * Whether a given user has already reviewed this listing. Used to gate
 * the review form ("you already reviewed — edit later") on the detail
 * page. Null user returns false (anonymous can't review anyway).
 */
export async function hasUserReviewed(
  userId: string | null,
  listingId: string,
): Promise<boolean> {
  if (!userId) return false
  const row = await prisma.review.findUnique({
    where: { listingId_authorId: { listingId, authorId: userId } },
    select: { id: true },
  })
  return row !== null
}
