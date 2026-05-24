import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

/**
 * Listing owner removes their public response from a review.
 * Clears `ownerResponse` to null without touching anything else. 404 if
 * the review doesn't exist or belongs to another owner's listing
 * (anti-leak).
 */
export async function deleteOwnerResponse(input: {
  ownerId: string
  reviewId: string
}): Promise<void> {
  const review = await prisma.review.findFirst({
    where: {
      id: input.reviewId,
      status: 'PUBLISHED',
      listing: { ownerId: input.ownerId },
    },
    select: { id: true },
  })
  if (!review) throw errors.notFound('Avis introuvable')

  await prisma.review.update({
    where: { id: review.id },
    data: { ownerResponse: null },
  })
}
