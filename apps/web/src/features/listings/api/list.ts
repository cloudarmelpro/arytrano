import 'server-only'
import { NextResponse } from 'next/server'
import { ok, withErrorHandling } from '@/lib/api/response'
import {
  listPublicListings,
  listPublicListingsQuerySchema,
} from '../queries/list-public-listings'

/**
 * GET /api/v1/listings — paginated public list, same query surface as
 * the web `/annonces` page (type, city, neighborhood, priceMin/Max,
 * sort, amenities CSV, q full-text, cursor).
 *
 * Public, no auth. CDN-cacheable for 60s when unfiltered.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const url = new URL(req.url)
  const q = Object.fromEntries(url.searchParams.entries())

  // We parse via .safeParse so invalid URL params don't 500 — they
  // silently fall back to defaults, same forgiving behavior the /annonces
  // page already has. A 400 here would force the mobile client to handle
  // an error for what is really "your sort= value is unrecognized".
  const parsed = listPublicListingsQuerySchema.safeParse({
    cursor: q.cursor,
    type: q.type || undefined,
    city: q.city || undefined,
    neighborhood: q.neighborhood || undefined,
    priceMin: q.priceMin || undefined,
    priceMax: q.priceMax || undefined,
    sort: q.sort || undefined,
    amenities: q.amenities || undefined,
    q: q.q || undefined,
  })
  const query = parsed.success ? parsed.data : {}

  const page = await listPublicListings(query)
  const res = ok(page.items, {
    meta: { nextCursor: page.nextCursor, hasMore: page.hasMore },
  })

  // Only cache when the request is unfiltered AND unpaginated — the
  // landing card grid hot path. Filtered/paginated variants vary
  // per-user-intent and have low cache-hit rate.
  const isHotPath =
    !q.cursor && !q.type && !q.city && !q.neighborhood && !q.priceMin && !q.priceMax && !q.sort && !q.amenities && !q.q
  if (isHotPath) {
    // Perf P1 : stale-while-revalidate lets the CDN serve the cached
    // payload immediately while refetching in the background,
    // eliminating the periodic ~200-400 ms cold-origin hit visible
    // to the first mobile client after TTL expiry.
    res.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
    )
  }
  return res as NextResponse
})
