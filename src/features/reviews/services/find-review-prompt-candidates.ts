import 'server-only'
import { prisma } from '@/lib/db'

export type ReviewPromptCandidate = {
  contactEventId: string
  viewerId: string
  viewerEmail: string
  viewerName: string | null
  viewerLocale: 'FR_MG' | 'MG'
  listingId: string
  listingTitle: string
  listingSlug: string
  citySlug: string
  neighborhoodSlug: string
  contactedAt: Date
}

/**
 * Select ContactEvents eligible for a review-prompt email. Criteria :
 *   - `viewerId` IS NOT NULL (anonymous reveals can't be linked to a
 *     user who could review)
 *   - `createdAt` < now() - 14d (the student has had 2 weeks to visit
 *     and form an opinion — any sooner is premature)
 *   - `reviewPromptSentAt` IS NULL (we never prompted this contact yet)
 *   - the viewer has NOT already submitted a Review for this listing
 *     (Review.authorId + listingId unique constraint covers it)
 *   - the listing is still PUBLISHED (the owner is still on platform)
 *   - the viewer's user is still ACTIVE (not deleted)
 *
 * Returns at most `limit` rows. Cron orchestrator iterates them.
 */
export async function findReviewPromptCandidates(
  limit = 100,
): Promise<ReviewPromptCandidate[]> {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  const rows = await prisma.contactEvent.findMany({
    where: {
      viewerId: { not: null },
      createdAt: { lt: cutoff },
      reviewPromptSentAt: null,
      // Postgres NOT EXISTS via Prisma's `none` filter.
      listing: {
        status: 'PUBLISHED',
        reviews: {
          // Could be empty array — we only filter out events where a
          // matching Review already exists.
          none: {
            // Note: we'd ideally compare review.authorId == contactEvent.viewerId
            // but Prisma doesn't support row-level comparison in relation filters.
            // The de-dup happens in the orchestrator after we read the row.
          },
        },
      },
      viewer: { status: 'ACTIVE' },
    },
    take: limit,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      viewerId: true,
      createdAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          slug: true,
          city: { select: { slug: true } },
          neighborhood: { select: { slug: true } },
        },
      },
      viewer: {
        select: {
          id: true,
          email: true,
          name: true,
          locale: true,
        },
      },
    },
  })

  // Final filter : drop events where the viewer already left a Review
  // on the listing. Can't do this in the WHERE because Prisma relation
  // filters can't reference parent fields. Cheap second pass.
  if (rows.length === 0) return []

  const pairs = rows.map((r) => ({ viewerId: r.viewerId!, listingId: r.listing.id }))
  const existingReviews = await prisma.review.findMany({
    where: {
      OR: pairs.map((p) => ({ authorId: p.viewerId, listingId: p.listingId })),
    },
    select: { authorId: true, listingId: true },
  })
  const reviewed = new Set(
    existingReviews.map((r) => `${r.authorId}:${r.listingId}`),
  )

  return rows
    .filter((r) => !reviewed.has(`${r.viewerId}:${r.listing.id}`))
    .map((r) => ({
      contactEventId: r.id,
      viewerId: r.viewer!.id,
      viewerEmail: r.viewer!.email,
      viewerName: r.viewer!.name,
      viewerLocale: r.viewer!.locale,
      listingId: r.listing.id,
      listingTitle: r.listing.title,
      listingSlug: r.listing.slug,
      citySlug: r.listing.city.slug,
      neighborhoodSlug: r.listing.neighborhood.slug,
      contactedAt: r.createdAt,
    }))
}
