import 'server-only'
import { NextResponse } from 'next/server'
import { ok, withErrorHandling } from '@/lib/api/response'
import { listCities } from '../queries/list-cities'

/**
 * GET /api/v1/cities — public catalog of seeded cities.
 *
 * No auth (catalog is public, same data the /annonces dropdowns show).
 * Cached 5min at the CDN to keep this endpoint near-free at scale.
 */
export const GET = withErrorHandling(async () => {
  const cities = await listCities()
  const res = ok(cities)
  // Catalog data turns over slowly (seeded ~once per quarter when we
  // add a city). 5min public CDN cache is the right floor.
  res.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
  return res as NextResponse
})
