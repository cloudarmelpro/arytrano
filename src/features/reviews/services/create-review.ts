import 'server-only'
import type { Review } from '@prisma/client'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import type { CreateReviewInput } from '../schemas/create-review'

/**
 * Visitor submits a review for a PUBLISHED listing.
 *
 * Eligibility (v0): any signed-in user who isn't the owner.
 * Each user can review a listing at most once — enforced by the
 * `@@unique([listingId, authorId])` constraint.
 *
 * Future hardening: gate behind a recorded ContactEvent ("verified stay"
 * badge) once contact-to-review correlation gets meaningful.
 */
export async function createReview(input: {
  authorId: string
  data: CreateReviewInput
}): Promise<Review> {
  const listing = await prisma.listing.findFirst({
    where: { id: input.data.listingId, status: 'PUBLISHED' },
    select: { id: true, ownerId: true },
  })
  if (!listing) throw errors.notFound('Annonce introuvable')
  if (listing.ownerId === input.authorId) {
    throw errors.forbidden('Vous ne pouvez pas évaluer votre propre annonce')
  }

  // Unique constraint catches double-submit; surface as conflict.
  const existing = await prisma.review.findUnique({
    where: { listingId_authorId: { listingId: listing.id, authorId: input.authorId } },
    select: { id: true },
  })
  if (existing) {
    throw errors.conflict('Vous avez déjà évalué cette annonce')
  }

  return prisma.review.create({
    data: {
      listingId: listing.id,
      authorId: input.authorId,
      rating: input.data.rating,
      body: input.data.body,
    },
  })
}
