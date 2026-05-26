import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import {
  parseEditorial,
  type NeighborhoodEditorial,
} from '@/features/geo'

export type NeighborhoodRow = {
  id: string
  slug: string
  nameFr: string
  nameMg: string
  citySlug: string
  publishedListings: number
  /**
   * E-T07 Batch B1 — DB-driven editorial copy. Null when the row's
   * `editorial` JSONB column hasn't been hydrated (the 4 new cities
   * pre-Batch C admin UI). Consumers should fall back to the legacy
   * `QUARTIER_DESCRIPTORS` TS module until Batch B2 flips the source
   * of truth entirely.
   */
  editorial: NeighborhoodEditorial | null
}

/**
 * All neighborhoods + their PUBLISHED listing count, sorted by activity
 * (most listings first, ties broken by name). Powers the landing's
 * "Explore par quartier" cards (T-043) — neighborhoods with 0 listings
 * still render with a "Bientôt" badge so the territorial coverage is
 * visible (also nudges owners in those quartiers to publish).
 *
 * Cached for 5 min — listing-publication freshness is welcome but not
 * critical for the mosaic on the homepage. Tag `neighborhoods-counts`
 * can be revalidated by publish/unpublish actions if needed.
 */
export const listNeighborhoodsWithCounts = unstable_cache(
  async (): Promise<NeighborhoodRow[]> => {
    const rows = await prisma.neighborhood.findMany({
      select: {
        id: true,
        slug: true,
        nameFr: true,
        nameMg: true,
        editorial: true,
        city: { select: { slug: true } },
        _count: { select: { listings: { where: { status: 'PUBLISHED' } } } },
      },
    })

    return rows
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        nameFr: r.nameFr,
        nameMg: r.nameMg,
        citySlug: r.city.slug,
        publishedListings: r._count.listings,
        editorial: parseEditorial(r.editorial),
      }))
      .sort((a, b) => {
        if (b.publishedListings !== a.publishedListings) {
          return b.publishedListings - a.publishedListings
        }
        return a.nameFr.localeCompare(b.nameFr)
      })
  },
  // v2 bump : NeighborhoodRow now carries `editorial`. Bumping the
  // cache key invalidates the v1 cache so consumers don't see a stale
  // row missing the new field after deploy.
  ['neighborhoods-counts-v2'],
  { revalidate: 300, tags: ['neighborhoods-counts'] },
)
