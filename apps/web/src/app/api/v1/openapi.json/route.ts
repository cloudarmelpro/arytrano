import { NextResponse } from 'next/server'
import { generateOpenApiSpec } from '@/lib/api/openapi'

/**
 * GET /api/v1/openapi.json — full OpenAPI 3.1 spec for the public API.
 *
 * The spec is generated at request time (cheap — pure in-memory work)
 * and CDN-cached 1h. Mobile devs paste this URL into Postman /
 * Insomnia / Stoplight to autogen TypeScript clients.
 */
export function GET() {
  const spec = generateOpenApiSpec()
  return NextResponse.json(spec, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      // The raw JSON spec has no <meta robots> escape hatch. Without
      // X-Robots-Tag, Googlebot indexes the full endpoint surface as
      // a public document (minor info-disclosure + crawl-budget waste).
      'X-Robots-Tag': 'noindex',
    },
  })
}
