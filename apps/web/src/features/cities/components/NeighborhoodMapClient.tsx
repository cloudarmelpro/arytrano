'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

/**
 * Performance audit C-1 (2026-05-29) — defer pigeon-maps to a Webpack
 * chunk separate from the initial /villes/<city>/quartiers/<n> page
 * bundle. See ListingsMapClient for the full rationale, including the
 * pigeon-maps `defaultProps.limitBounds` type quirk that forces the
 * `ComponentType<any>` cast below.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Map = dynamic<any>(
  () => import('pigeon-maps').then((m) => m.Map as ComponentType<unknown>),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 animate-pulse bg-muted/60"
        aria-hidden
      />
    ),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as ComponentType<any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Overlay = dynamic<any>(
  () => import('pigeon-maps').then((m) => m.Overlay as ComponentType<unknown>),
  { ssr: false },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as ComponentType<any>

const STADIA_API_KEY = process.env.NEXT_PUBLIC_STADIA_API_KEY
const STADIA_STYLE = process.env.NEXT_PUBLIC_STADIA_STYLE ?? 'alidade_smooth'

function stadiaTileProvider(
  x: number,
  y: number,
  z: number,
  dpr?: number,
): string {
  const retina = dpr && dpr >= 2 ? '@2x' : ''
  return `https://tiles.stadiamaps.com/tiles/${STADIA_STYLE}/${z}/${x}/${y}${retina}.png?api_key=${STADIA_API_KEY}`
}

/**
 * Single-point zoomed map for a neighborhood landing page. Different
 * from QuartiersMapClient (city-wide with multiple pins) — this one
 * is focused on the neighborhood center and shows just one marker
 * to anchor the visitor.
 *
 * Zoom 14 — close enough to see surrounding streets, wide enough to
 * keep the visitor oriented relative to the rest of the city.
 */
export function NeighborhoodMapClient({
  lat,
  lng,
  label,
}: {
  lat: number
  lng: number
  label: string
}) {
  return (
    <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl bg-muted max-[720px]:aspect-[4/3]">
      <Map
        defaultCenter={[lat, lng]}
        defaultZoom={14}
        minZoom={12}
        maxZoom={17}
        attributionPrefix={false}
        provider={STADIA_API_KEY ? stadiaTileProvider : undefined}
        attribution={
          <span className="font-sans text-[10.5px]">
            {STADIA_API_KEY ? (
              <>
                ©{' '}
                <a
                  href="https://stadiamaps.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Stadia Maps
                </a>
                {' '}©{' '}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  OpenStreetMap
                </a>
              </>
            ) : (
              <>
                ©{' '}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  OpenStreetMap
                </a>
              </>
            )}
          </span>
        }
      >
        <Overlay anchor={[lat, lng]} offset={[16, 32]}>
          <div
            aria-label={label}
            className="rounded-full bg-primary px-3 py-1.5 text-[12.5px] font-bold text-primary-foreground shadow-[0_1px_2px_rgba(16,18,40,.06),0_8px_20px_-8px_rgba(16,18,40,.3)]"
          >
            {label}
          </div>
        </Overlay>
      </Map>
    </div>
  )
}
