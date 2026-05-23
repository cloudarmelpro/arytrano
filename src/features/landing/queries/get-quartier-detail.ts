import 'server-only'
import { prisma } from '@/lib/db'

export type QuartierDetailListing = {
  id: string
  slug: string
  title: string
  type: 'ROOM' | 'STUDIO' | 'APARTMENT' | 'HOUSE'
  priceMonthlyMGA: number
  publishedAt: Date | null
  verifiedAt: Date | null
  photo: {
    url: string
    width: number
    height: number
    blurhash: string | null
    altFr: string | null
  } | null
}

export type QuartierSibling = {
  slug: string
  nameFr: string
  nameMg: string
  publishedListings: number
}

export type QuartierDetail = {
  city: {
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
  publishedListings: number
  avgPriceMGA: number | null
  /** Up to 6 most-recent published listings in this quartier. */
  recentListings: QuartierDetailListing[]
  /** Up to 4 sibling quartiers in the same city, ordered by listing count. */
  siblings: QuartierSibling[]
}

const RECENT_LIMIT = 6
const SIBLINGS_LIMIT = 4

/**
 * Page data for `/quartiers/[citySlug]/[quartierSlug]`. Returns null
 * when either the city OR the neighborhood doesn't exist — caller
 * turns that into a `notFound()`. Composite lookup by (citySlug,
 * quartierSlug) is required because neighborhood slugs are unique
 * PER city, not globally.
 *
 * Three parallel queries:
 *  1. The neighborhood itself + its city
 *  2. Aggregate count + avg price for THIS neighborhood (single SQL)
 *  3. Recent 6 listings + siblings (4 other quartiers in the same city)
 */
export async function getQuartierDetail(
  citySlug: string,
  quartierSlug: string,
): Promise<QuartierDetail | null> {
  const neighborhood = await prisma.neighborhood.findFirst({
    where: { slug: quartierSlug, city: { slug: citySlug } },
    select: {
      id: true,
      slug: true,
      nameFr: true,
      nameMg: true,
      lat: true,
      lng: true,
      cityId: true,
      city: {
        select: { slug: true, nameFr: true, nameMg: true },
      },
    },
  })
  if (!neighborhood) return null

  const [aggregate, recentListings, siblings, siblingCounts] = await Promise.all([
    prisma.listing.aggregate({
      where: { status: 'PUBLISHED', neighborhoodId: neighborhood.id },
      _count: { _all: true },
      _avg: { priceMonthlyMGA: true },
    }),
    prisma.listing.findMany({
      where: { status: 'PUBLISHED', neighborhoodId: neighborhood.id },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: RECENT_LIMIT,
      select: {
        id: true,
        slug: true,
        title: true,
        type: true,
        priceMonthlyMGA: true,
        publishedAt: true,
        verifiedAt: true,
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
    prisma.neighborhood.findMany({
      where: {
        cityId: neighborhood.cityId,
        slug: { not: quartierSlug },
      },
      select: { id: true, slug: true, nameFr: true, nameMg: true },
    }),
    // Single groupBy on sibling listing counts so we can sort by it
    // before slicing to SIBLINGS_LIMIT.
    prisma.listing.groupBy({
      by: ['neighborhoodId'],
      where: {
        status: 'PUBLISHED',
        neighborhood: { cityId: neighborhood.cityId, slug: { not: quartierSlug } },
      },
      _count: { _all: true },
    }),
  ])

  const countByNeighborhoodId = new Map(
    siblingCounts.map((s) => [s.neighborhoodId, s._count._all]),
  )

  const orderedSiblings: QuartierSibling[] = siblings
    .map((s) => ({
      slug: s.slug,
      nameFr: s.nameFr,
      nameMg: s.nameMg,
      publishedListings: countByNeighborhoodId.get(s.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.publishedListings !== a.publishedListings) {
        return b.publishedListings - a.publishedListings
      }
      return a.nameFr.localeCompare(b.nameFr)
    })
    .slice(0, SIBLINGS_LIMIT)

  return {
    city: neighborhood.city,
    neighborhood: {
      id: neighborhood.id,
      slug: neighborhood.slug,
      nameFr: neighborhood.nameFr,
      nameMg: neighborhood.nameMg,
      lat: Number(neighborhood.lat),
      lng: Number(neighborhood.lng),
    },
    publishedListings: aggregate._count._all,
    avgPriceMGA:
      aggregate._avg.priceMonthlyMGA !== null
        ? Math.round(aggregate._avg.priceMonthlyMGA)
        : null,
    recentListings: recentListings.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      type: l.type,
      priceMonthlyMGA: l.priceMonthlyMGA,
      publishedAt: l.publishedAt,
      verifiedAt: l.verifiedAt,
      photo: l.photos[0] ?? null,
    })),
    siblings: orderedSiblings,
  }
}

/**
 * Listing of every (citySlug, quartierSlug) pair — used to populate
 * the sitemap and `generateStaticParams` once we want to pre-render
 * detail pages at build time.
 */
export async function listAllQuartiersForSitemap(): Promise<
  Array<{ citySlug: string; quartierSlug: string }>
> {
  const rows = await prisma.neighborhood.findMany({
    select: { slug: true, city: { select: { slug: true } } },
    orderBy: [{ city: { slug: 'asc' } }, { slug: 'asc' }],
  })
  return rows.map((r) => ({ citySlug: r.city.slug, quartierSlug: r.slug }))
}
