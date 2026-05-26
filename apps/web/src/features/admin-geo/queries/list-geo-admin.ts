import 'server-only'
import { prisma } from '@/lib/db'
import { parseEditorial, parseQuizProfile } from '@/features/geo'

/**
 * Admin geo overview — every City + Neighborhood with coverage indicators
 * (does it have `editorial`? `quizProfile`? how many PUBLISHED listings?).
 * Powers the `/admin/geo` page so the admin can spot rows that still
 * need editorial work at a glance.
 *
 * Not paginated — at v1 scale we have ~5 cities × ~10 neighborhoods.
 * If we ever cross 100 neighborhoods, swap the table for a paged list.
 */
export type GeoAdminNeighborhood = {
  id: string
  slug: string
  nameFr: string
  nameMg: string
  hasEditorial: boolean
  hasQuizProfile: boolean
  publishedListingsCount: number
}

export type GeoAdminCity = {
  id: string
  slug: string
  nameFr: string
  nameMg: string
  neighborhoods: GeoAdminNeighborhood[]
}

export async function listGeoAdmin(): Promise<GeoAdminCity[]> {
  const cities = await prisma.city.findMany({
    select: {
      id: true,
      slug: true,
      nameFr: true,
      nameMg: true,
      neighborhoods: {
        select: {
          id: true,
          slug: true,
          nameFr: true,
          nameMg: true,
          editorial: true,
          quizProfile: true,
          _count: {
            select: { listings: { where: { status: 'PUBLISHED' } } },
          },
        },
        orderBy: { nameFr: 'asc' },
      },
    },
    orderBy: { nameFr: 'asc' },
  })

  return cities.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameFr: c.nameFr,
    nameMg: c.nameMg,
    neighborhoods: c.neighborhoods.map((n) => ({
      id: n.id,
      slug: n.slug,
      nameFr: n.nameFr,
      nameMg: n.nameMg,
      hasEditorial: parseEditorial(n.editorial) !== null,
      hasQuizProfile: parseQuizProfile(n.quizProfile) !== null,
      publishedListingsCount: n._count.listings,
    })),
  }))
}
