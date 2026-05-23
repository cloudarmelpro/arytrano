import 'server-only'
import { prisma } from '@/lib/db'

export type PublicCity = {
  id: string
  slug: string
  nameFr: string
  nameMg: string
  lat: number
  lng: number
}

/**
 * Slim cities catalog for the mobile API (`GET /api/v1/cities`).
 *
 * Differs from `listCitiesWithNeighborhoods` :
 *  - No nested neighborhoods (lighter payload — mobile fetches them
 *    on-demand per city)
 *  - Coerces Decimal → number so the JSON serializes cleanly
 */
export async function listCities(): Promise<PublicCity[]> {
  const rows = await prisma.city.findMany({
    orderBy: { nameFr: 'asc' },
    select: { id: true, slug: true, nameFr: true, nameMg: true, lat: true, lng: true },
  })
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameFr: c.nameFr,
    nameMg: c.nameMg,
    lat: Number(c.lat),
    lng: Number(c.lng),
  }))
}
