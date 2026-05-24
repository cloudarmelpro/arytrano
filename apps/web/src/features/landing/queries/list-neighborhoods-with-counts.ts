import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

export type NeighborhoodRow = {
  id: string
  slug: string
  nameFr: string
  nameMg: string
  citySlug: string
  publishedListings: number
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
      }))
      .sort((a, b) => {
        if (b.publishedListings !== a.publishedListings) {
          return b.publishedListings - a.publishedListings
        }
        return a.nameFr.localeCompare(b.nameFr)
      })
  },
  ['neighborhoods-counts-v1'],
  { revalidate: 300, tags: ['neighborhoods-counts'] },
)
