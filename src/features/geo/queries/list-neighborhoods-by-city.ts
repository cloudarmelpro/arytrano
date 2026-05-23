import 'server-only'
import { prisma } from '@/lib/db'

export type PublicNeighborhood = {
  id: string
  slug: string
  nameFr: string
  nameMg: string
  lat: number
  lng: number
}

/**
 * Neighborhoods for one city (`GET /api/v1/cities/:slug/neighborhoods`).
 * Returns `null` when the city slug doesn't match — handler turns that
 * into a 404.
 */
export async function listNeighborhoodsByCity(
  citySlug: string,
): Promise<PublicNeighborhood[] | null> {
  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
    select: {
      neighborhoods: {
        orderBy: { nameFr: 'asc' },
        select: {
          id: true,
          slug: true,
          nameFr: true,
          nameMg: true,
          lat: true,
          lng: true,
        },
      },
    },
  })
  if (!city) return null
  return city.neighborhoods.map((n) => ({
    id: n.id,
    slug: n.slug,
    nameFr: n.nameFr,
    nameMg: n.nameMg,
    lat: Number(n.lat),
    lng: Number(n.lng),
  }))
}
