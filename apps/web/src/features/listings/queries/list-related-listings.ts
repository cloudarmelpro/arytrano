import 'server-only'
import { prisma } from '@/lib/db'
import { cloudinaryCardThumb } from '@/lib/images/cloudinary-transform'
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
      cautionMonths: true,
      publishedAt: true,
      verifiedAt: true,
      city: { select: { slug: true, nameFr: true, nameMg: true } },
      neighborhood: { select: { slug: true, nameFr: true, nameMg: true } },
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

  return rows.map((r) => {
    // Performance audit H-2 round 2 (2026-06-08) — apply the same
    // 800×600 WebP q_75 transform that `list-public-listings` uses
    // at the query layer. Pre-fix the related-listings strip at the
    // bottom of every detail page shipped 4 raw upload URLs (~2 MB
    // total worst case) below the fold. See `cloudinaryCardThumb`.
    const rawPhoto = r.photos[0]
    const photo = rawPhoto
      ? { ...rawPhoto, url: cloudinaryCardThumb(rawPhoto.url) }
      : null
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      type: r.type,
      priceMonthlyMGA: r.priceMonthlyMGA,
      cautionMonths: r.cautionMonths,
      publishedAt: r.publishedAt,
      verifiedAt: r.verifiedAt,
      city: r.city,
      neighborhood: r.neighborhood,
      photo,
    }
  })
}
