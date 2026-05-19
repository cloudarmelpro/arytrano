import 'server-only'
import { prisma } from '@/lib/db'
import { maybeWatermark } from '@/lib/cloudinary/watermark'

export type QuartierSampleListing = {
  id: string
  slug: string
  title: string
  type: 'ROOM' | 'STUDIO' | 'APARTMENT' | 'HOUSE'
  priceMonthlyMGA: number
  photo: {
    url: string
    width: number
    height: number
    blurhash: string | null
    altFr: string | null
  } | null
}

export type QuartierRow = {
  id: string
  slug: string
  nameFr: string
  nameMg: string
  citySlug: string
  publishedListings: number
  avgPriceMGA: number | null
  sampleListings: QuartierSampleListing[]
}

export type QuartiersPageData = {
  quartiers: QuartierRow[]
  totalListings: number
}

const SAMPLES_PER_QUARTIER = 2

/**
 * Quartiers directory data. Hot path on `/quartiers`, so we avoid
 * loading every published listing across every quartier just to
 * compute an average and an N=2 sample.
 *
 * Three parallel queries:
 *  1. The neighborhoods themselves (8 rows, all metadata).
 *  2. `groupBy` → aggregate `_count` + `_avg(priceMonthlyMGA)` per
 *     neighborhood, filtered on PUBLISHED. One SQL, no per-row payload.
 *  3. Per-quartier sample query (the 2 newest published listings).
 *     Done via a LATERAL JOIN-style approach: one findMany per
 *     quartier with `take: SAMPLES_PER_QUARTIER`. 8 quartiers × 2
 *     rows = 16 rows max instead of full corpus.
 *
 * Net: O(quartiers × SAMPLES_PER_QUARTIER) ≪ O(full corpus).
 */
export async function getQuartiersData(): Promise<QuartiersPageData> {
  const neighborhoods = await prisma.neighborhood.findMany({
    select: {
      id: true,
      slug: true,
      nameFr: true,
      nameMg: true,
      city: { select: { slug: true } },
    },
  })

  if (neighborhoods.length === 0) {
    return { quartiers: [], totalListings: 0 }
  }

  const neighborhoodIds = neighborhoods.map((n) => n.id)

  const [aggregates, ...sampleRows] = await Promise.all([
    prisma.listing.groupBy({
      by: ['neighborhoodId'],
      where: { status: 'PUBLISHED', neighborhoodId: { in: neighborhoodIds } },
      _count: { _all: true },
      _avg: { priceMonthlyMGA: true },
    }),
    ...neighborhoodIds.map((id) =>
      prisma.listing.findMany({
        where: { status: 'PUBLISHED', neighborhoodId: id },
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        take: SAMPLES_PER_QUARTIER,
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          priceMonthlyMGA: true,
          watermarkOptIn: true,
          neighborhoodId: true,
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
    ),
  ])

  const aggByNeighborhood = new Map(
    aggregates.map((a) => [
      a.neighborhoodId,
      {
        count: a._count._all,
        avg: a._avg.priceMonthlyMGA ?? null,
      },
    ]),
  )

  const samplesByNeighborhood = new Map<string, QuartierSampleListing[]>()
  for (const list of sampleRows) {
    for (const l of list) {
      const entry = samplesByNeighborhood.get(l.neighborhoodId) ?? []
      entry.push({
        id: l.id,
        slug: l.slug,
        title: l.title,
        type: l.type,
        priceMonthlyMGA: l.priceMonthlyMGA,
        photo: l.photos[0]
          ? {
              ...l.photos[0],
              url: maybeWatermark(l.photos[0].url, l.watermarkOptIn),
            }
          : null,
      })
      samplesByNeighborhood.set(l.neighborhoodId, entry)
    }
  }

  const quartiers: QuartierRow[] = neighborhoods
    .map((n) => {
      const agg = aggByNeighborhood.get(n.id)
      return {
        id: n.id,
        slug: n.slug,
        nameFr: n.nameFr,
        nameMg: n.nameMg,
        citySlug: n.city.slug,
        publishedListings: agg?.count ?? 0,
        avgPriceMGA: agg?.avg !== undefined && agg?.avg !== null ? Math.round(agg.avg) : null,
        sampleListings: samplesByNeighborhood.get(n.id) ?? [],
      }
    })
    .sort((a, b) => {
      if (b.publishedListings !== a.publishedListings) {
        return b.publishedListings - a.publishedListings
      }
      return a.nameFr.localeCompare(b.nameFr)
    })

  const totalListings = quartiers.reduce(
    (s, q) => s + q.publishedListings,
    0,
  )

  return { quartiers, totalListings }
}
