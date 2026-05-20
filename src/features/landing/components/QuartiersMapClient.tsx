'use client'

import { useState } from 'react'
import { Map, Overlay } from 'pigeon-maps'
import type { Locale } from '@/lib/i18n/config'
import type { QuartierRow } from '../queries/get-quartiers-data'

// Fianarantsoa center — v0.5 is single-city, so hardcoding the center
// is correct. When multi-city ships, derive from props (e.g. centroid
// of the passed quartiers) so the same component handles any city.
const FIANARANTSOA_CENTER: [number, number] = [-21.4554, 47.0857]
const DEFAULT_ZOOM = 13

export function QuartiersMapClient({
  locale,
  quartiers,
}: {
  locale: Locale
  quartiers: QuartierRow[]
}) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)

  return (
    <div className="relative aspect-[16/7] w-full overflow-hidden rounded-[20px] border border-border bg-muted max-[720px]:aspect-[4/3]">
      <Map
        defaultCenter={FIANARANTSOA_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        minZoom={11}
        maxZoom={16}
        attributionPrefix={false}
        // OSM ToS requires keeping the © OpenStreetMap credit visible;
        // the "Pigeon" brand prefix is removed via attributionPrefix.
        attribution={
          <span className="font-sans text-[10.5px]">
            ©{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              OpenStreetMap
            </a>
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
