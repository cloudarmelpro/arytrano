import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

export type CityWithNeighborhoods = {
  id: string
  slug: string
  nameFr: string
  nameMg: string
  neighborhoods: Array<{
    id: string
    slug: string
    nameFr: string
    nameMg: string
  }>
}

/**
 * All seeded cities and their neighborhoods, sorted by city then neighborhood
 * name. Used by the listing form to populate the city + neighborhood selects.
 *
 * Performance audit C-2 (2026-05-29) — this is a "geography lookup
 * table" that changes maybe once a quarter (new neighborhood added).
 * Pre-fix, every page that needed the dropdown ran the join on every
 * request : /, /annonces, /dashboard/listings/new, /dashboard/listings/[id]/edit.
 * Wrapped in `unstable_cache` with a 1-hour TTL + named tag so admin
 * adds can invalidate explicitly via `revalidateTag('cities-geo')`.
 * 37 quartiers × 7 cities at launch — payload is small enough that
 * tag-revalidation cost is negligible.
 */
export const listCitiesWithNeighborhoods = unstable_cache(
  async (): Promise<CityWithNeighborhoods[]> => {
    return prisma.city.findMany({
      orderBy: { nameFr: 'asc' },
      select: {
        id: true,
        slug: true,
        nameFr: true,
        nameMg: true,
        neighborhoods: {
          orderBy: { nameFr: 'asc' },
          select: { id: true, slug: true, nameFr: true, nameMg: true },
        },
      },
    })
  },
  ['cities-with-neighborhoods'],
  { revalidate: 3600, tags: ['cities-geo'] },
)
