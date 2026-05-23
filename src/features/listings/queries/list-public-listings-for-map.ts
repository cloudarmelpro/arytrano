import 'server-only'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { escapeLike } from '@/lib/db/like-escape'
import { listPublicListingsQuerySchema, type ListPublicListingsQuery } from './list-public-listings'

/**
 * Map view query — sister of `listPublicListings` (E-T10).
 *
 * Differences :
 *  - No pagination. Map needs ALL matching listings at once so every
 *    quartier shows its real count, not "20 of N".
 *  - Hard cap at 500 to bound the JSON payload (~50KB worst case).
 *    Madagascar launch volume will be 50-200 — the cap is a safety net.
 *  - Includes neighborhood `lat`/`lng` (cast Decimal → number client-side).
 *  - Drops cursor/order — map UI doesn't care about page order.
 */

// Lowered from 500 → 200 per audit (SEC P1) — bounds the payload an
// abusive scraper can pull per request without affecting v1 scale
// (Madagascar launch catalog is 50-200 listings total). When we
// cross into multi-hundred quartiers we should add a real per-IP
// rate-limit on `/annonces?view=map` rather than rely on the cap.
const MAP_HARD_CAP = 200

export type PublicMapListing = {
  id: string
  slug: string
  title: string
  priceMonthlyMGA: number
  citySlug: string
  neighborhoodSlug: string
  neighborhoodLat: number
  neighborhoodLng: number
  neighborhoodNameFr: string
  photoUrl: string | null
}

export async function listPublicListingsForMap(
  input: Partial<ListPublicListingsQuery> = {},
): Promise<PublicMapListing[]> {
  // Re-parse defensively so callers passing raw URL strings get the
  // same validation as the grid query.
  const parsed = listPublicListingsQuerySchema.safeParse(input)
  const q: Partial<ListPublicListingsQuery> = parsed.success ? parsed.data : {}

  const where: Prisma.ListingWhereInput = { status: 'PUBLISHED' }
  if (q.type) where.type = q.type
  if (q.city) where.city = { slug: q.city }
  if (q.neighborhood) {
    where.neighborhood = q.city
      ? { slug: q.neighborhood, city: { slug: q.city } }
      : { slug: q.neighborhood }
  }
  if (q.priceMin !== undefined || q.priceMax !== undefined) {
    where.priceMonthlyMGA = {
      ...(q.priceMin !== undefined && { gte: q.priceMin }),
      ...(q.priceMax !== undefined && { lte: q.priceMax }),
    }
  }
  if (q.amenities && q.amenities.length > 0) {
    where.amenities = { hasEvery: q.amenities }
  }
  if (q.q) {
    const safe = escapeLike(q.q)
    where.OR = [
      { title: { contains: safe, mode: 'insensitive' } },
      { description: { contains: safe, mode: 'insensitive' } },
    ]
  }

  const rows = await prisma.listing.findMany({
    where,
    take: MAP_HARD_CAP,
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      priceMonthlyMGA: true,
      city: { select: { slug: true } },
      neighborhood: {
        select: { slug: true, nameFr: true, lat: true, lng: true },
      },
      photos: {
        take: 1,
        orderBy: { position: 'asc' },
        select: { url: true },
      },
    },
  })

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    priceMonthlyMGA: r.priceMonthlyMGA,
    citySlug: r.city.slug,
    neighborhoodSlug: r.neighborhood.slug,
    neighborhoodLat: Number(r.neighborhood.lat),
    neighborhoodLng: Number(r.neighborhood.lng),
    neighborhoodNameFr: r.neighborhood.nameFr,
    photoUrl: r.photos[0]?.url ?? null,
  }))
}
