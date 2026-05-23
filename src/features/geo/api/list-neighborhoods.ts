import 'server-only'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { listNeighborhoodsByCity } from '../queries/list-neighborhoods-by-city'

const slugSchema = z.string().regex(/^[a-z0-9-]{2,80}$/, 'Invalid city slug')

/**
 * GET /api/v1/cities/:slug/neighborhoods — neighborhoods of one city.
 * 404 when the slug doesn't match a seeded city.
 */
export const GET = withErrorHandling(
  async (
    _req: Request,
    ctx: { params: Promise<{ slug: string }> },
  ): Promise<Response> => {
    const { slug } = await ctx.params
    const parsed = slugSchema.safeParse(slug)
    if (!parsed.success) {
      throw errors.notFound('City not found')
    }
    const neighborhoods = await listNeighborhoodsByCity(parsed.data)
    if (neighborhoods === null) {
      throw errors.notFound('City not found')
    }
    const res = ok(neighborhoods)
    res.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
    return res as NextResponse
  },
)
