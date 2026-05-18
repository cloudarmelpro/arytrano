import 'server-only'
import type { ListingStatus, ListingType } from '@prisma/client'
import { prisma } from '@/lib/db'

export type OwnerListingItem = {
  id: string
  title: string
  slug: string
  status: ListingStatus
  type: ListingType
  priceMonthlyMGA: number
  city: { slug: string; nameFr: string }
  neighborhood: { slug: string; nameFr: string }
  photoCount: number
  contactCount: number
  /** OPEN reports on this listing — surfaces a "needs attention" badge on the card. */
  openReportCount: number
  thumbnailUrl: string | null
  createdAt: Date
  publishedAt: Date | null
}

/**
 * Owner's listings (excluding DELETED). Sorted by updatedAt desc.
 * Lightweight projection — no description, no full photo list — used
 * by the dashboard listings table.
 */
export async function listOwnerListings(ownerId: string): Promise<OwnerListingItem[]> {
  const rows = await prisma.listing.findMany({
    where: { ownerId, status: { not: 'DELETED' } },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      type: true,
      priceMonthlyMGA: true,
      createdAt: true,
      publishedAt: true,
      city: { select: { slug: true, nameFr: true } },
      neighborhood: { select: { slug: true, nameFr: true } },
      _count: {
        select: {
          photos: true,
          contactEvents: true,
          reports: { where: { status: 'OPEN' } },
        },
      },
      photos: {
        orderBy: { position: 'asc' },
        take: 1,
        select: { url: true },
      },
    },
  })

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    status: r.status,
    type: r.type,
    priceMonthlyMGA: r.priceMonthlyMGA,
    city: r.city,
    neighborhood: r.neighborhood,
    photoCount: r._count.photos,
    contactCount: r._count.contactEvents,
    openReportCount: r._count.reports,
    thumbnailUrl: r.photos[0]?.url ?? null,
    createdAt: r.createdAt,
    publishedAt: r.publishedAt,
  }))
}
