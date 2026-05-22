import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const alt = 'AryTrano — Logement étudiant par quartier'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

/**
 * Dynamic OG image for /villes/[city]/quartiers/[neighborhood]
 * (E-T11 B3). Smaller "Quartier" eyebrow + the city name as
 * sub-heading so social previews communicate the hierarchy at a
 * glance.
 */
export default async function NeighborhoodOpenGraphImage({
  params,
}: {
  params: { citySlug: string; neighborhoodSlug: string }
}) {
  const neighborhood = await prisma.neighborhood.findFirst({
    where: {
      slug: params.neighborhoodSlug,
      city: { slug: params.citySlug },
    },
    select: {
      nameFr: true,
      city: { select: { nameFr: true } },
      _count: {
        select: {
          listings: { where: { status: 'PUBLISHED' } },
        },
      },
    },
  })

  const quartierName = neighborhood?.nameFr ?? 'Quartier'
  const cityName = neighborhood?.city.nameFr ?? 'Madagascar'
  const count = neighborhood?._count.listings ?? 0
  const countLabel =
    count === 0 ? 'Bientôt' : `${count} annonce${count > 1 ? 's' : ''}`

  const PRIMARY = '#191970'

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            Quartier · {cityName}
          </div>
          <div
            style={{
              fontSize: '108px',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-0.025em',
            }}
          >
            {quartierName}
          </div>
          <div
            style={{
              fontSize: '30px',
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
          <span>arytrano.mg</span>
          <span>{cityName} · Madagascar</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
