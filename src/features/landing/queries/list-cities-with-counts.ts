import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

export type CityWithCount = {
  id: string
  slug: string
  nameFr: string
  nameMg: string
  lat: number
  lng: number
  /** Count of PUBLISHED listings. Drives empty-state UX on /quartiers/[city]. */
  listingCount: number
}

/**
 * All seeded cities + their PUBLISHED listing count. Used by :
 *   - `LandingSearchCard` to populate the CitySelect dropdown
 *   - `/quartiers/[citySlug]` to render the empty state when count = 0
 *   - Mobile API `/api/v1/cities`
 *
 * Sort order : descending by count, then alphabetical. Cities with
 * inventory float to the top — visitors see the most useful options
 * first; the dead-empty cities still appear so owners in those
 * areas know they CAN list.
 *
 * Cached 5 min : the list churns slowly (seed-only changes + new
 * publish events) so a short TTL is plenty. Invalidate via
 * `revalidateTag('cities-with-counts')` if needed.
 */
export const listCitiesWithCounts = unstable_cache(
  async (): Promise<CityWithCount[]> => {
    const rows = await prisma.city.findMany({
      select: {
        id: true,
        slug: true,
        nameFr: true,
        nameMg: true,
        lat: true,
        lng: true,
        _count: {
          select: {
            listings: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    })

    return rows
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        nameFr: r.nameFr,
        nameMg: r.nameMg,
        // Prisma Decimal → number for client transport. Coordinates
        // already fit in JS float precision (6 decimal places).
        lat: Number(r.lat),
        lng: Number(r.lng),
        listingCount: r._count.listings,
      }))
      .sort((a, b) => {
        if (a.listingCount !== b.listingCount) {
          return b.listingCount - a.listingCount
        }
        return a.nameFr.localeCompare(b.nameFr, 'fr')
      })
  },
  ['cities-with-counts'],
  { revalidate: 300, tags: ['cities-with-counts'] },
)
