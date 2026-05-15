import 'server-only'
import { prisma } from '@/lib/db'

const PAGE_SIZE = 10

export type PublicReview = {
  id: string
  /** Author cuid — exposed so the detail page can gate edit/delete
   * controls to the author. Cuid is not enumerable, not PII. */
  authorId: string
  rating: number
  body: string
  ownerResponse: string | null
  verifiedStay: boolean
  createdAt: Date
  author: {
    /** First name only — privacy mirror of get-public-listing owner.displayName. */
    displayName: string
    image: string | null
  }
}

export type ListListingReviewsPage = {
  items: PublicReview[]
  nextCursor: string | null
  hasMore: boolean
}

/**
 * Public reviews for a listing — PUBLISHED only, newest-first.
 * Cursor-based pagination keyed on review id (createdAt has good
 * tiebreaker via id).
 *
 * Author projection is privacy-safe: first name + image only, never
 * email or full name.
 */
export async function listListingReviews(
  listingId: string,
  cursor?: string,
): Promise<ListListingReviewsPage> {
  const rows = await prisma.review.findMany({
    where: { listingId, status: 'PUBLISHED' },
    take: PAGE_SIZE + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      authorId: true,
      rating: true,
      body: true,
      ownerResponse: true,
      verifiedStay: true,
      createdAt: true,
      author: { select: { name: true, image: true } },
    },
  })

  const hasMore = rows.length > PAGE_SIZE
  const sliced = hasMore ? rows.slice(0, PAGE_SIZE) : rows
  const lastRow = sliced[sliced.length - 1]
  const nextCursor = hasMore && lastRow ? lastRow.id : null

  return {
    items: sliced.map((r) => ({
      id: r.id,
      authorId: r.authorId,
      rating: r.rating,
      body: r.body,
      ownerResponse: r.ownerResponse,
      verifiedStay: r.verifiedStay,
      createdAt: r.createdAt,
      author: {
        displayName: r.author.name?.trim().split(/\s+/)[0] ?? 'Anonyme',
        image: r.author.image,
      },
    })),
    nextCursor,
    hasMore,
  }
}
