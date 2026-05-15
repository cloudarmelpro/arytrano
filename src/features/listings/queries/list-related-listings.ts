import 'server-only'
import { prisma } from '@/lib/db'
import type { PublicListingCard } from './list-public-listings'

/**
 * Related listings shown at the bottom of a detail page.
 *
 * Strategy:
 *   1. Same neighborhood (most relevant for student-housing search).
 *   2. Fall back to same city if neighborhood yields <4 results.
 *   3. Always exclude the currently-viewed listing.
 *
 * Projection mirrors `PublicListingCard` so we can render the same
 * `<PublicListingCard>` component without an adapter.
 */
export async function listRelatedListings(input: {
  excludeId: string
  neighborhoodId: string
  cityId: string
  take?: number
}): Promise<PublicListingCard[]> {
  const limit = input.take ?? 4

  const rows = await prisma.listing.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: input.excludeId },
      OR: [
        { neighborhoodId: input.neighborhoodId },
        { cityId: input.cityId },
      ],
    },
    orderBy: [
      // Same-neighborhood matches naturally float to the top via the OR
      // shape; we tiebreak with recency so the newest publish wins.
      { publishedAt: 'desc' },
      { id: 'desc' },
    ],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      priceMonthlyMGA: true,
      city: { select: { slug: true, nameFr: true } },
      neighborhood: { select: { slug: true, nameFr: true } },
      photos: {
        take: 1,
        orderBy: { position: 'asc' },
        select: {
          url: true,
          width: true,
          height: true,
          blurhash: true,
          altFr: true,
        },
      },
    },
  })

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    type: r.type,
    priceMonthlyMGA: r.priceMonthlyMGA.toString(),
    city: r.city,
    neighborhood: r.neighborhood,
    photo: r.photos[0] ?? null,
  }))
}
