import 'server-only'
import { prisma } from '@/lib/db'
import {
  parseEditorial,
  parseQuizProfile,
  type NeighborhoodEditorial,
  type QuartierQuizProfile,
} from '@/features/geo'

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
  lat: number
  lng: number
  publishedListings: number
  avgPriceMGA: number | null
  sampleListings: QuartierSampleListing[]
  /**
   * E-T07 Batch B1 — DB-driven copies of the formerly-TS-only data.
   * `editorial` is null when the row hasn't been hydrated yet (the 4
   * new cities); consumers fall back to the legacy TS modules until
   * Batch B2 flips the source of truth. `quizProfile` is currently
   * populated for all 5 launch cities (we seeded profiles today).
   */
  editorial: NeighborhoodEditorial | null
  quizProfile: QuartierQuizProfile | null
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
export async function getQuartiersData(
  citySlug?: string,
): Promise<QuartiersPageData> {
  const neighborhoods = await prisma.neighborhood.findMany({
    where: citySlug ? { city: { slug: citySlug } } : undefined,
    select: {
      id: true,
      slug: true,
      nameFr: true,
      nameMg: true,
      lat: true,
      lng: true,
      editorial: true,
      quizProfile: true,
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
        photo: l.photos[0] ?? null,
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
        // Prisma Decimal → plain number for client serialization
        // (pigeon-maps expects numeric lat/lng).
        lat: Number(n.lat),
        lng: Number(n.lng),
        publishedListings: agg?.count ?? 0,
        avgPriceMGA: agg?.avg !== undefined && agg?.avg !== null ? Math.round(agg.avg) : null,
        sampleListings: samplesByNeighborhood.get(n.id) ?? [],
        editorial: parseEditorial(n.editorial),
        quizProfile: parseQuizProfile(n.quizProfile),
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
