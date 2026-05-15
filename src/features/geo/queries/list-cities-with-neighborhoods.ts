import 'server-only'
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
 */
export async function listCitiesWithNeighborhoods(): Promise<CityWithNeighborhoods[]> {
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
}
