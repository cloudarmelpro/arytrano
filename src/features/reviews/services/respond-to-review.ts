import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import type { RespondToReviewInput } from '../schemas/create-review'

/**
 * Listing owner publishes a one-time public reply to a review on their
 * listing. v0 keeps it simple: a single `ownerResponse` text column on
 * the Review row — no threading, no edit history. Owner can overwrite
 * but the field is one-per-review.
 */
export async function respondToReview(input: {
  ownerId: string
  data: RespondToReviewInput
}): Promise<void> {
  const review = await prisma.review.findFirst({
    where: {
      id: input.data.reviewId,
      status: 'PUBLISHED',
      listing: { ownerId: input.ownerId },
    },
    select: { id: true },
  })
  if (!review) {
    // 404 whether the review doesn't exist OR belongs to another owner's
    // listing — avoids leaking existence to non-owners.
    throw errors.notFound('Avis introuvable')
  }

  await prisma.review.update({
    where: { id: review.id },
    data: { ownerResponse: input.data.body },
  })
}
