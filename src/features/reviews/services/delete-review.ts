import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

/**
 * Author deletes their own review.
 *
 * Soft-delete via `status = DELETED` — keeps the row for moderation /
 * dispute trails and means the `@@unique([listingId, authorId])`
 * constraint still applies. If the author wants to re-post, they need
 * to wait for an admin to hard-purge OR we add a `re-create` path that
 * flips status back to PUBLISHED. v0 keeps it simple — one shot.
 *
 * Owner response is preserved (frozen in time, no longer visible since
 * the parent review is hidden from `listListingReviews`).
 */
export async function deleteReview(input: {
  authorId: string
  reviewId: string
}): Promise<void> {
  const review = await prisma.review.findFirst({
    where: {
      id: input.reviewId,
      authorId: input.authorId,
      status: 'PUBLISHED',
    },
    select: { id: true },
  })
  if (!review) throw errors.notFound('Avis introuvable')

  await prisma.review.update({
    where: { id: review.id },
    data: { status: 'DELETED' },
  })
}
