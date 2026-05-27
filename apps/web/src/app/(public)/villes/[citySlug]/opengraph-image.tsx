import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const alt = 'AryTrano — Logement étudiant à Madagascar'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

/**
 * Dynamic OG image for /villes/[citySlug] (E-T11 B3).
 *
 * Renders a branded card with the city name + listing count via
 * next/og's ImageResponse. Static-optimized by default — Next will
 * cache the generated PNG by params, so a single OG image per city
 * gets built once and served as-is to crawlers.
 *
 * `next/og` only accepts a subset of CSS — no Tailwind class lookup,
 * no external CSS files, only inline `style` props with a strict
 * property allowlist. We keep this intentionally minimal.
 */
export default async function CityOpenGraphImage({
  params,
}: {
  params: { citySlug: string }
}) {
  // Resolve params before any data fetch — Next 16 expects params to
  // be awaited if Promise-shaped, but image route handlers receive
  // a synchronous params object.
  const city = await prisma.city.findUnique({
    where: { slug: params.citySlug },
    select: {
      nameFr: true,
      _count: {
        select: {
          listings: { where: { status: 'PUBLISHED' } },
        },
      },
    },
  })

  // Fallback to a generic image if the slug doesn't match (rare —
  // visitors should reach a 404 page before getting here, but
  // crawlers sometimes ping OG endpoints out of order).
  const cityName = city?.nameFr ?? 'Madagascar'
  const count = city?._count.listings ?? 0
  const countLabel =
    count === 0 ? 'Bientôt' : `${count} annonce${count > 1 ? 's' : ''}`

  // AryTrano brand color (matches `--color-primary` oklch in CSS) —
  // ImageResponse can't read CSS vars, so we use the resolved sRGB.
  const PRIMARY = '#191970' // approx oklch(0.32 0.17 280)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '80px',
          backgroundColor: PRIMARY,
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'white',
              color: PRIMARY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            AryTrano
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            Logement étudiant
          </div>
          <div
            style={{
              fontSize: '120px',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-0.025em',
            }}
          >
            {cityName}
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {countLabel}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '22px',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <span>arytrano.com</span>
          <span>Madagascar</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
