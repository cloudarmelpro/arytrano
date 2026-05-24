import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import type { PublicListingCardData } from '@/features/listings'

const TOP_LISTINGS_LIMIT = 12

export type NeighborhoodLandingData = {
  city: {
    id: string
    slug: string
    nameFr: string
    nameMg: string
  }
  neighborhood: {
    id: string
    slug: string
    nameFr: string
    nameMg: string
    lat: number
    lng: number
  }
  listings: PublicListingCardData[]
  stats: {
    totalListings: number
    avgPriceMGA: number | null
    reviewCount: number
    avgRating: number | null
  }
  /** Other quartiers in the same city — drives the "Voir les autres" rail at the bottom. */
  siblings: Array<{
    slug: string
    nameFr: string
    nameMg: string
    listingCount: number
  }>
}

function buildGetNeighborhoodLandingData() {
  return async (
    citySlug: string,
    neighborhoodSlug: string,
  ): Promise<NeighborhoodLandingData | null> => {
    const neighborhood = await prisma.neighborhood.findFirst({
      where: { slug: neighborhoodSlug, city: { slug: citySlug } },
      select: {
        id: true,
        slug: true,
        nameFr: true,
        nameMg: true,
        lat: true,
        lng: true,
        city: {
          select: { id: true, slug: true, nameFr: true, nameMg: true },
        },
      },
    })
    if (!neighborhood) return null

    const [
      listingsRaw,
      totalListings,
      priceAgg,
      reviewAgg,
      siblings,
    ] = await Promise.all([
      prisma.listing.findMany({
        where: {
          status: 'PUBLISHED',
          neighborhoodId: neighborhood.id,
        },
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        take: TOP_LISTINGS_LIMIT,
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          priceMonthlyMGA: true,
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
      }),
      prisma.listing.count({
        where: {
          status: 'PUBLISHED',
          neighborhoodId: neighborhood.id,
        },
      }),
      prisma.listing.aggregate({
        where: {
          status: 'PUBLISHED',
          neighborhoodId: neighborhood.id,
        },
        _avg: { priceMonthlyMGA: true },
      }),
      prisma.review.aggregate({
        where: {
          status: 'PUBLISHED',
          listing: { neighborhoodId: neighborhood.id },
        },
        _count: { _all: true },
        _avg: { rating: true },
      }),
      prisma.neighborhood.findMany({
        where: {
          cityId: neighborhood.city.id,
          NOT: { id: neighborhood.id },
        },
        orderBy: { nameFr: 'asc' },
        select: {
          slug: true,
          nameFr: true,
          nameMg: true,
          _count: {
            select: {
              listings: { where: { status: 'PUBLISHED' } },
            },
          },
        },
      }),
    ])

    return {
      city: {
        id: neighborhood.city.id,
        slug: neighborhood.city.slug,
        nameFr: neighborhood.city.nameFr,
        nameMg: neighborhood.city.nameMg,
      },
      neighborhood: {
        id: neighborhood.id,
        slug: neighborhood.slug,
        nameFr: neighborhood.nameFr,
        nameMg: neighborhood.nameMg,
        lat: Number(neighborhood.lat),
        lng: Number(neighborhood.lng),
      },
      listings: listingsRaw.map((l) => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        type: l.type,
        priceMonthlyMGA: l.priceMonthlyMGA,
        publishedAt: l.publishedAt,
        verifiedAt: l.verifiedAt,
        city: l.city,
        neighborhood: l.neighborhood,
        photo: l.photos[0] ?? null,
      })),
      stats: {
        totalListings,
        avgPriceMGA:
          priceAgg._avg.priceMonthlyMGA !== null
            ? Math.round(priceAgg._avg.priceMonthlyMGA)
            : null,
        reviewCount: reviewAgg._count._all,
        avgRating:
          reviewAgg._count._all > 0
            ? Number(reviewAgg._avg.rating?.toFixed(1) ?? null)
            : null,
      },
      siblings: siblings.map((s) => ({
        slug: s.slug,
        nameFr: s.nameFr,
        nameMg: s.nameMg,
        listingCount: s._count.listings,
      })),
    }
  }
}

/**
 * Neighborhood landing data. Same caching shape as the city query —
 * 5-min TTL, shared invalidation tag so a single
 * `revalidateTag('city-landing-data')` from admin tooling refreshes
 * both layers at once.
 */
export const getNeighborhoodLandingData = unstable_cache(
  buildGetNeighborhoodLandingData(),
  ['neighborhood-landing-data'],
  { revalidate: 300, tags: ['city-landing-data'] },
)
