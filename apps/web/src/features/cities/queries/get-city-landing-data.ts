import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import type { PublicListingCardData } from '@/features/listings'
import { getRatingsForListings } from '@/features/listings/queries/get-ratings-for-listings'

const TOP_LISTINGS_LIMIT = 8

export type CityLandingData = {
  city: {
    id: string
    slug: string
    nameFr: string
    nameMg: string
    lat: number
    lng: number
  }
  neighborhoods: Array<{
    slug: string
    nameFr: string
    nameMg: string
    lat: number
    lng: number
    listingCount: number
  }>
  topListings: PublicListingCardData[]
  stats: {
    totalListings: number
    verifiedOwners: number
    neighborhoodsCount: number
  }
}

/**
 * Aggregated payload for the city landing page (`/villes/[citySlug]`).
 *
 * One pass per data source — Prisma can't join them all into a single
 * query without losing the type safety we get from `select`. Cached
 * 5 min via `unstable_cache` since the underlying data (counts +
 * averages) changes slowly and the city landing pages are SEO-driven
 * hot paths.
 *
 * Returns null when the city slug doesn't match a seeded row — caller
 * (route) renders notFound().
 */
function buildGetCityLandingData() {
  return async (citySlug: string): Promise<CityLandingData | null> => {
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
      select: {
        id: true,
        slug: true,
        nameFr: true,
        nameMg: true,
        lat: true,
        lng: true,
      },
    })
    if (!city) return null

    const [neighborhoodsRaw, topRows, totalListings, verifiedOwners] =
      await Promise.all([
        prisma.neighborhood.findMany({
          where: { cityId: city.id },
          orderBy: { nameFr: 'asc' },
          select: {
            slug: true,
            nameFr: true,
            nameMg: true,
            lat: true,
            lng: true,
            _count: {
              select: {
                listings: { where: { status: 'PUBLISHED' } },
              },
            },
          },
        }),
        prisma.listing.findMany({
          where: { status: 'PUBLISHED', cityId: city.id },
          orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
          take: TOP_LISTINGS_LIMIT,
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
            video: { select: { url: true } },
          },
        }),
        prisma.listing.count({
          where: { status: 'PUBLISHED', cityId: city.id },
        }),
        prisma.user.count({
          where: {
            listings: { some: { cityId: city.id, status: 'PUBLISHED' } },
            ownerProfile: { verifiedAt: { not: null } },
          },
        }),
      ])

    const ratings = await getRatingsForListings(topRows.map((l) => l.id))

    return {
      city: {
        id: city.id,
        slug: city.slug,
        nameFr: city.nameFr,
        nameMg: city.nameMg,
        lat: Number(city.lat),
        lng: Number(city.lng),
      },
      neighborhoods: neighborhoodsRaw.map((n) => ({
        slug: n.slug,
        nameFr: n.nameFr,
        nameMg: n.nameMg,
        lat: Number(n.lat),
        lng: Number(n.lng),
        listingCount: n._count.listings,
      })),
      topListings: topRows.map((l) => {
        const rating = ratings.get(l.id) ?? { avg: null, count: 0 }
        return {
          id: l.id,
          slug: l.slug,
          title: l.title,
          type: l.type,
          priceMonthlyMGA: l.priceMonthlyMGA,
          cautionMonths: l.cautionMonths,
          publishedAt: l.publishedAt,
          verifiedAt: l.verifiedAt,
          avgRating: rating.avg,
          reviewCount: rating.count,
          hasVideo: l.video !== null,
          city: l.city,
          neighborhood: l.neighborhood,
          photo: l.photos[0] ?? null,
        }
      }),
      stats: {
        totalListings,
        verifiedOwners,
        neighborhoodsCount: neighborhoodsRaw.length,
      },
    }
  }
}

/**
 * Cached 5 min — counts + neighborhoods slow-change, and Google
 * crawlers + visitors hit these URLs concurrently. `tags` lets
 * future mutations (admin listing publish) invalidate on demand.
 */
export const getCityLandingData = unstable_cache(
  buildGetCityLandingData(),
  ['city-landing-data'],
  { revalidate: 300, tags: ['city-landing-data'] },
)
