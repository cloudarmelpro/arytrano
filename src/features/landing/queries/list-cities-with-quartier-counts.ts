import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

export type CityQuartierCount = {
  slug: string
  nameFr: string
  nameMg: string
  /** Number of Neighborhood rows seeded for this city. Drives the
   *  /quartiers/[citySlug] CityNav pill count + the empty-state. */
  quartierCount: number
}

/**
 * All seeded cities + the number of quartiers each one has. Used by
 * the `QuartiersCityNav` switcher on `/quartiers/[citySlug]`.
 *
 * Distinct from `listCitiesWithCounts` which counts PUBLISHED LISTINGS,
 * not quartiers — different signal, different audience. Quartier
 * counts change rarely (seed-only), so a 10-min TTL is fine.
 */
export const listCitiesWithQuartierCounts = unstable_cache(
  async (): Promise<CityQuartierCount[]> => {
    const rows = await prisma.city.findMany({
      orderBy: { nameFr: 'asc' },
      select: {
        slug: true,
        nameFr: true,
        nameMg: true,
        _count: { select: { neighborhoods: true } },
      },
    })
    return rows.map((r) => ({
      slug: r.slug,
      nameFr: r.nameFr,
      nameMg: r.nameMg,
      quartierCount: r._count.neighborhoods,
    }))
  },
  ['cities-with-quartier-counts'],
  { revalidate: 600, tags: ['cities-with-quartier-counts'] },
)
