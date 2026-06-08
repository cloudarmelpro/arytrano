'use client'

import { useState, type ComponentType } from 'react'
import dynamic from 'next/dynamic'
import type { Locale } from '@/lib/i18n/config'
import type { QuartierRow } from '../queries/get-quartiers-data'

/**
 * Performance audit C-1 (2026-05-29) — see ListingsMapClient for the
 * full rationale. Lazy-load pigeon-maps so the initial page bundle
 * doesn't carry the ~45 kB gz lib for visitors who don't open the
 * /quartiers landing.
 */
// pigeon-maps' `defaultProps.limitBounds` is typed as `string` upstream
// — the `ComponentType<any>` cast bridges that to next/dynamic's stricter
// component-type constraint. See ListingsMapClient for the matching note.
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

// Pre-multi-city fallback. The component now derives center from
// the centroid of the passed quartiers so /quartiers/<anyCity>
// works without a city-specific constant. This stays only as the
// "no quartiers seeded yet" safety value.
const FALLBACK_CENTER: [number, number] = [-21.4554, 47.0857] // Fianarantsoa
const DEFAULT_ZOOM = 13

/**
 * Average lat/lng across the passed quartiers. Falls back to
 * Fianarantsoa when the list is empty (loading state / brand-new
 * city with no seeded quartiers yet). Math.average works for the
 * Madagascar coordinate range — antimeridian crossing isn't a
 * concern, the country sits within a single hemisphere.
 */
function centerOfQuartiers(
  quartiers: ReadonlyArray<{ lat: number; lng: number }>,
): [number, number] {
  if (quartiers.length === 0) return FALLBACK_CENTER
  let sumLat = 0
  let sumLng = 0
  for (const q of quartiers) {
    sumLat += q.lat
    sumLng += q.lng
  }
  return [sumLat / quartiers.length, sumLng / quartiers.length]
}

// Tile provider (AUD-008). When the Stadia API key is set, we use
// Stadia's commercial tile endpoint (200k views/mo free, paid above).
// Without a key, pigeon-maps falls back to `tile.openstreetmap.org`
// — fine for dev, rate-limited at commercial scale.
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

export function QuartiersMapClient({
  locale,
  quartiers,
}: {
  locale: Locale
  quartiers: QuartierRow[]
}) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)
  const center = centerOfQuartiers(quartiers)

  return (
    <div className="relative aspect-[16/7] w-full overflow-hidden rounded-[20px] border border-border bg-muted max-[720px]:aspect-[4/3]">
      <Map
        // `key` forces a re-mount when the center moves to a new city
        // (lat changes by > 0.1) — pigeon-maps caches `defaultCenter`
        // on mount and ignores re-renders, so without the key the
        // first navigation to a different city would still center on
        // the old one. Coarse-grained key avoids flicker on hover.
        key={`${Math.round(center[0] * 10)}:${Math.round(center[1] * 10)}`}
        defaultCenter={center}
        defaultZoom={DEFAULT_ZOOM}
        minZoom={11}
        maxZoom={16}
        attributionPrefix={false}
        provider={STADIA_API_KEY ? stadiaTileProvider : undefined}
        // Attribution ToS: Stadia requires "© Stadia Maps © OpenMapTiles
        // © OpenStreetMap contributors" when their tiles are used. OSM
        // alone needs just "© OpenStreetMap contributors".
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
                  href="https://openmaptiles.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  OpenMapTiles
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
        {quartiers.map((q) => {
          const name = locale === 'mg' ? q.nameMg : q.nameFr
          const isHovered = hoveredSlug === q.slug
          return (
            <Overlay key={q.slug} anchor={[q.lat, q.lng]} offset={[0, 0]}>
              <a
                href={`#${q.slug}`}
                onMouseEnter={() => setHoveredSlug(q.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                onFocus={() => setHoveredSlug(q.slug)}
                onBlur={() => setHoveredSlug(null)}
                style={{ transform: 'translate(-50%, -100%)' }}
                className={`pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-foreground shadow-[0_1px_2px_rgba(16,18,40,.06),0_8px_20px_-8px_rgba(16,18,40,.18)] transition will-change-transform hover:z-10 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[720px]:gap-1.5 max-[720px]:px-2 max-[720px]:py-1 max-[720px]:text-[11.5px] ${
                  isHovered ? 'scale-[1.04]' : ''
                }`}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                {name}
                <span className="font-mono text-[12px] text-muted-foreground">
                  {q.publishedListings}
                </span>
              </a>
            </Overlay>
          )
        })}
      </Map>
    </div>
  )
}
