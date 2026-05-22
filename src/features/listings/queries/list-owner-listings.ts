import 'server-only'
import type { ListingStatus, ListingType } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * Precomputed classification of how close a listing is to expiry.
 * Computed in the query (outside the React render path) so the page
 * stays pure for the React Compiler.
 *
 *   - 'safe'    : expiresAt > 14 days away → no badge, no CTA
 *   - 'warning' : 7-14 days → amber tint
 *   - 'urgent'  : 0-7 days → red tint, "Prolonger" CTA visible
 *   - 'expired' : status=UNAVAILABLE (auto-expire cron flipped it)
 *   - null      : no expiresAt (DRAFT, SUSPENDED, DELETED)
 */
export type ExpiryClass = 'safe' | 'warning' | 'urgent' | 'expired' | null

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
  /** T-049: TTL end. NULL on DRAFT, set on first publish. Owner can extend. */
  expiresAt: Date | null
  /** Derived from status + expiresAt at query time — see ExpiryClass. */
  expiryClass: ExpiryClass
}

function classifyExpiry(
  status: ListingStatus,
  expiresAt: Date | null,
  nowMs: number,
): ExpiryClass {
  if (status === 'UNAVAILABLE') return 'expired'
  if (!expiresAt || status !== 'PUBLISHED') return null
  const daysLeft = Math.ceil(
    (expiresAt.getTime() - nowMs) / (24 * 60 * 60 * 1000),
  )
  if (daysLeft <= 7) return 'urgent'
  if (daysLeft <= 14) return 'warning'
  return 'safe'
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
      expiresAt: true,
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

  // Date.now() called ONCE here in the query layer — outside any
  // React render path. The result is shipped to the RSC as a regular
  // value, which the React Compiler treats as pure.
  const nowMs = Date.now()

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
    expiresAt: r.expiresAt,
    expiryClass: classifyExpiry(r.status, r.expiresAt, nowMs),
  }))
}
