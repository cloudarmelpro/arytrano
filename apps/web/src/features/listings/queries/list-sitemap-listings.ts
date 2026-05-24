import 'server-only'
import { prisma } from '@/lib/db'

export type SitemapListing = {
  slug: string
  citySlug: string
  neighborhoodSlug: string
  updatedAt: Date
}

/**
 * Listings to include in `/sitemap.xml`. PUBLISHED only, ordered by
 * recency, capped at 5000 to stay under the 50k/file sitemap limit.
 * If we grow past that, split into multiple sitemap files via the
 * sitemap-index pattern instead of raising this cap.
 *
 * Projection is intentionally narrow (just the slugs and `updatedAt`) —
 * the sitemap doesn't need title / description / photos.
 */
export async function listSitemapListings(limit = 5000): Promise<SitemapListing[]> {
  const rows = await prisma.listing.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: {
      slug: true,
      updatedAt: true,
      city: { select: { slug: true } },
      neighborhood: { select: { slug: true } },
    },
  })
  return rows.map((r) => ({
    slug: r.slug,
    citySlug: r.city.slug,
    neighborhoodSlug: r.neighborhood.slug,
    updatedAt: r.updatedAt,
  }))
}
