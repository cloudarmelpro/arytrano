import 'server-only'
import { prisma } from '@/lib/db'
import {
  parseEditorial,
  parseQuizProfile,
  type NeighborhoodEditorial,
  type QuartierQuizProfile,
} from '@/features/geo'

export type GeoAdminNeighborhoodDetail = {
  id: string
  slug: string
  nameFr: string
  nameMg: string
  citySlug: string
  cityNameFr: string
  editorial: NeighborhoodEditorial | null
  quizProfile: QuartierQuizProfile | null
  publishedListingsCount: number
}

/**
 * Single-neighborhood detail keyed by `(citySlug, neighborhoodSlug)`.
 * The composite `@@unique([cityId, slug])` on Neighborhood means we
 * cannot use `findUnique` on slug alone — two cities can share a
 * slug (`anjoma` exists in Fianarantsoa AND Toamasina).
 *
 * Returns null when no row matches — the admin page handles it with
 * a 404.
 */
export async function getNeighborhoodForAdmin(
  citySlug: string,
  neighborhoodSlug: string,
): Promise<GeoAdminNeighborhoodDetail | null> {
  const row = await prisma.neighborhood.findFirst({
    where: { slug: neighborhoodSlug, city: { slug: citySlug } },
    select: {
      id: true,
      slug: true,
      nameFr: true,
      nameMg: true,
      editorial: true,
      quizProfile: true,
      city: { select: { slug: true, nameFr: true } },
      _count: {
        select: { listings: { where: { status: 'PUBLISHED' } } },
      },
    },
  })

  if (!row) return null

  return {
    id: row.id,
    slug: row.slug,
    nameFr: row.nameFr,
    nameMg: row.nameMg,
    citySlug: row.city.slug,
    cityNameFr: row.city.nameFr,
    editorial: parseEditorial(row.editorial),
    quizProfile: parseQuizProfile(row.quizProfile),
    publishedListingsCount: row._count.listings,
  }
}
