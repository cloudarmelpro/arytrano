import 'server-only'
import type { Review } from '@prisma/client'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import type { UpdateReviewInput } from '../schemas/create-review'

/**
 * Author edits their own review.
 *
 * 404 on any mismatch (review missing OR owned by a different author OR
 * status not PUBLISHED) — same response either way to avoid leaking
 * existence to a non-author probing review ids.
 *
 * The owner's response (`ownerResponse`) is intentionally NOT cleared
 * when the author edits — the response stands until the owner rewrites
 * it. This mirrors how Airbnb / Google handle review edits.
 */
export async function updateReview(input: {
  authorId: string
  data: UpdateReviewInput
}): Promise<Review> {
  const review = await prisma.review.findFirst({
    where: {
      id: input.data.reviewId,
      authorId: input.authorId,
      status: 'PUBLISHED',
    },
    select: { id: true },
  })
  if (!review) throw errors.notFound('Avis introuvable')

  return prisma.review.update({
    where: { id: review.id },
    data: {
      rating: input.data.rating,
      body: input.data.body,
    },
  })
}
