import 'server-only'
import { prisma } from '@/lib/db'

export type ListingStatsRecentContact = {
  id: string
  channel: 'WHATSAPP' | 'PHONE'
  createdAt: Date
  /** True when a known signed-in user revealed (vs anonymous). No identity exposed. */
  hasViewer: boolean
}

export type ListingStats = {
  listing: {
    id: string
    title: string
    slug: string
    status: string
    publishedAt: Date | null
    citySlug: string
    neighborhoodSlug: string
  }
  totals: {
    contacts: number
    reviews: number
    reviewsAverage: number | null
  }
  last30Days: {
    contacts: number
    contactsByChannel: { WHATSAPP: number; PHONE: number }
    /** Reviews are slow-flow — show 30d window for symmetry, even if usually 0. */
    reviews: number
  }
  recentContacts: ListingStatsRecentContact[]
}

/**
 * Owner stats for a single listing (T-046). Read-only — the caller is
 * responsible for authorizing the request (in practice the owner
 * dashboard route guard runs `auth()` + checks `ownerId`).
 *
 * Aggregates :
 *   - Total ContactEvents + last-30d split (overall + by channel)
 *   - Total Review count + arithmetic average rating (avg only when
 *     ≥ 1 review — null otherwise to avoid "0.00 ★" rendering)
 *   - 30d Review count
 *   - 5 most recent ContactEvents (channel + when + has-known-viewer
 *     flag, NO PII — we don't expose the student's email/IP to the
 *     owner, just the count + channel breakdown)
 *
 * Returns null when the listing doesn't exist or belongs to another
 * user (callers MUST pass `ownerId` to enforce the access check at
 * the DB layer — no second round-trip needed).
 */
export async function getListingStats(
  listingId: string,
  ownerId: string,
): Promise<ListingStats | null> {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      city: { select: { slug: true } },
      neighborhood: { select: { slug: true } },
    },
  })
  if (!listing) return null

  const cutoff30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    contactsTotal,
    contacts30dRaw,
    reviewsAgg,
    reviews30d,
    recentContacts,
  ] = await Promise.all([
    prisma.contactEvent.count({ where: { listingId: listing.id } }),
    prisma.contactEvent.groupBy({
      by: ['channel'],
      where: { listingId: listing.id, createdAt: { gte: cutoff30d } },
      _count: { _all: true },
    }),
    prisma.review.aggregate({
      where: { listingId: listing.id },
      _count: { _all: true },
      _avg: { rating: true },
    }),
    prisma.review.count({
      where: { listingId: listing.id, createdAt: { gte: cutoff30d } },
    }),
    prisma.contactEvent.findMany({
      where: { listingId: listing.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        channel: true,
        createdAt: true,
        viewerId: true,
      },
    }),
  ])

  const contactsByChannel: { WHATSAPP: number; PHONE: number } = {
    WHATSAPP: 0,
    PHONE: 0,
  }
  for (const row of contacts30dRaw) {
    contactsByChannel[row.channel] = row._count._all
  }
  const contacts30d = contactsByChannel.WHATSAPP + contactsByChannel.PHONE

  return {
    listing: {
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      status: listing.status,
      publishedAt: listing.publishedAt,
      citySlug: listing.city.slug,
      neighborhoodSlug: listing.neighborhood.slug,
    },
    totals: {
      contacts: contactsTotal,
      reviews: reviewsAgg._count._all,
      reviewsAverage:
        reviewsAgg._count._all > 0 ? (reviewsAgg._avg.rating ?? null) : null,
    },
    last30Days: {
      contacts: contacts30d,
      contactsByChannel,
      reviews: reviews30d,
    },
    recentContacts: recentContacts.map((c) => ({
      id: c.id,
      channel: c.channel,
      createdAt: c.createdAt,
      hasViewer: c.viewerId !== null,
    })),
  }
}
