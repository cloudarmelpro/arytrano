import 'server-only'
import type { Review } from '@prisma/client'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { errors } from '@/lib/api/errors'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildReviewReceivedEmail } from '@/lib/email/templates/review-received'
import type { CreateReviewInput } from '../schemas/create-review'

/**
 * Visitor submits a review for a PUBLISHED listing.
 *
 * Eligibility (v0): any signed-in user who isn't the owner.
 * Each user can review a listing at most once — enforced by the
 * `@@unique([listingId, authorId])` constraint.
 *
 * `verifiedStay` (T-031) — computed at submit time from the presence of
 * a prior `ContactEvent` linking the author to this listing. This is a
 * proxy for "the student actually reached out via the platform before
 * leaving a review"; off-platform contact (WhatsApp direct) produces
 * false negatives, accepted in v0.5. Computed once at submit so the
 * badge is stable even if past contact events get pruned later.
 */
export async function createReview(input: {
  authorId: string
  data: CreateReviewInput
}): Promise<Review> {
  const listing = await prisma.listing.findFirst({
    where: { id: input.data.listingId, status: 'PUBLISHED' },
    select: {
      id: true,
      ownerId: true,
      title: true,
      slug: true,
      city: { select: { slug: true } },
      neighborhood: { select: { slug: true } },
      owner: { select: { id: true, email: true, name: true, locale: true } },
    },
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

  const verifiedStay = await hasPriorContactEvent(input.authorId, listing.id)

  // Read the author's display-name BEFORE the write so we can email the
  // owner without a second round-trip after the insert.
  const author = await prisma.user.findUnique({
    where: { id: input.authorId },
    select: { name: true },
  })

  const review = await prisma.review.create({
    data: {
      listingId: listing.id,
      authorId: input.authorId,
      rating: input.data.rating,
      body: input.data.body,
      verifiedStay,
    },
  })

  // T-034: fire-and-forget email to owner. Author's display name is the
  // first token of their full name (privacy-preserving — matches what the
  // public review row exposes). Excerpt is the first ~200 chars of the
  // body, plain text (no HTML — escapeHtml runs in the template).
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const reviewerDisplayName =
    author?.name?.trim().split(/\s+/)[0] ?? 'Étudiant'
  const reviewExcerpt =
    review.body.length > 200 ? review.body.slice(0, 197).trimEnd() + '…' : review.body
  const email = buildReviewReceivedEmail(fromPrismaLocale(listing.owner.locale), {
    recipientName: listing.owner.name ?? 'Propriétaire',
    listingTitle: listing.title,
    reviewerDisplayName,
    rating: review.rating,
    reviewExcerpt,
    listingUrl: `${baseUrl}/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`,
    verifiedStay,
  })
  void sendTransactionalEmail({
    recipientId: listing.owner.id,
    recipientEmail: listing.owner.email,
    eventType: 'review-received',
    ...email,
  })

  return review
}

/**
 * True if the author has at least one ContactEvent on this listing before
 * NOW. Recorded contact events have an `ipHash` (recordContactClick) and
 * optionally a `viewerId` when the visitor is signed in — we only credit
 * the verified-stay flag when the signed-in author was the one who
 * clicked, so we filter on `viewerId` (not ipHash, since IPs are shared
 * on student campuses).
 */
async function hasPriorContactEvent(
  authorId: string,
  listingId: string,
): Promise<boolean> {
  const hit = await prisma.contactEvent.findFirst({
    where: { listingId, viewerId: authorId },
    select: { id: true },
  })
  return Boolean(hit)
}
