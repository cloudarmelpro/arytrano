import 'server-only'
import { prisma } from '@/lib/db'

export type CompareRow = {
  id: string
  title: string
  slug: string
  citySlug: string
  neighborhoodSlug: string
  cityName: string
  neighborhoodName: string
  priceMonthlyMGA: number
  bedrooms: number | null
  bathrooms: number | null
  surfaceM2: number | null
  furnished: boolean
  amenities: string[]
  type: string
  status: string
  primaryPhotoUrl: string | null
}

/**
 * TEN-01 — cheap batch lookup used by /compare. Filters out non-
 * PUBLISHED listings so a stale localStorage entry doesn't leak a
 * suspended or deleted row.
 */
export async function getListingsForCompare(ids: string[]): Promise<CompareRow[]> {
  if (ids.length === 0) return []
  const rows = await prisma.listing.findMany({
    where: {
      id: { in: ids },
      status: { in: ['PUBLISHED', 'UNAVAILABLE'] },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      priceMonthlyMGA: true,
      bedrooms: true,
      bathrooms: true,
      surfaceM2: true,
      furnished: true,
      amenities: true,
      type: true,
      status: true,
      city: { select: { slug: true, nameFr: true } },
      neighborhood: { select: { slug: true, nameFr: true } },
      photos: {
        select: { url: true },
        orderBy: { position: 'asc' },
        take: 1,
      },
    },
  })
  const byId = new Map(rows.map((r) => [r.id, r]))
  // Preserve caller order for the side-by-side table.
  return ids
    .map((id) => byId.get(id))
    .filter((r): r is (typeof rows)[number] => Boolean(r))
    .map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      citySlug: r.city.slug,
      neighborhoodSlug: r.neighborhood.slug,
      cityName: r.city.nameFr,
      neighborhoodName: r.neighborhood.nameFr,
      priceMonthlyMGA: r.priceMonthlyMGA,
      bedrooms: r.bedrooms,
      bathrooms: r.bathrooms,
      surfaceM2: r.surfaceM2,
      furnished: r.furnished,
      amenities: r.amenities,
      type: r.type,
      status: r.status,
      primaryPhotoUrl: r.photos[0]?.url ?? null,
    }))
}
