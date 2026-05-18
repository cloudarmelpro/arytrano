import 'server-only'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { errors } from '@/lib/api/errors'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildReviewRepliedEmail } from '@/lib/email/templates/review-replied'
import type { RespondToReviewInput } from '../schemas/create-review'

/**
 * Listing owner publishes a one-time public reply to a review on their
 * listing. v0 keeps it simple: a single `ownerResponse` text column on
 * the Review row — no threading, no edit history. Owner can overwrite
 * but the field is one-per-review.
 *
 * E-T06: notify the review author only on the FIRST response (null →
 * set). Later edits don't re-email (avoids triple-notification on minor
 * tweaks); the transactional rate-limit handles abuse beyond that.
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
    select: {
      id: true,
      ownerResponse: true,
      author: { select: { id: true, email: true, name: true, locale: true } },
      listing: {
        select: {
          title: true,
          slug: true,
          city: { select: { slug: true } },
          neighborhood: { select: { slug: true } },
          owner: { select: { name: true } },
        },
      },
    },
  })
  if (!review) {
    // 404 whether the review doesn't exist OR belongs to another owner's
    // listing — avoids leaking existence to non-owners.
    throw errors.notFound('Avis introuvable')
  }

  const wasFirstResponse = !review.ownerResponse

  await prisma.review.update({
    where: { id: review.id },
    data: { ownerResponse: input.data.body },
  })

  if (wasFirstResponse) {
    const baseUrl = env.AUTH_URL.replace(/\/$/, '')
    const ownerDisplayName =
      review.listing.owner.name?.trim().split(/\s+/)[0] ?? 'Le propriétaire'
    const responseExcerpt =
      input.data.body.length > 200
        ? input.data.body.slice(0, 197).trimEnd() + '…'
        : input.data.body
    const email = buildReviewRepliedEmail(
      fromPrismaLocale(review.author.locale),
      {
        recipientName: review.author.name?.trim().split(/\s+/)[0] ?? 'Étudiant',
        listingTitle: review.listing.title,
        listingUrl: `${baseUrl}/${review.listing.city.slug}/${review.listing.neighborhood.slug}/${review.listing.slug}`,
        ownerDisplayName,
        responseExcerpt,
      },
    )
    void sendTransactionalEmail({
      recipientId: review.author.id,
      recipientEmail: review.author.email,
      eventType: 'review-replied',
      ...email,
    })
  }
}
