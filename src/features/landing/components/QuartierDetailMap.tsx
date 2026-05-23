'use client'

import { Map as PigeonMap, Overlay } from 'pigeon-maps'

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
 * Single-pin map for the per-quartier detail page. Zoomed in tighter
 * than the /quartiers/<city> overview map so visitors see the
 * neighborhood streets, not the whole city outline.
 */
export function QuartierDetailMap({
  lat,
  lng,
  label,
}: {
  lat: number
  lng: number
  label: string
}) {
  return (
    <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl border border-border bg-muted max-[720px]:aspect-[4/3]">
      <PigeonMap
        defaultCenter={[lat, lng]}
        defaultZoom={15}
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
        <Overlay anchor={[lat, lng]} offset={[20, 20]}>
          <div
            aria-label={label}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_2px_4px_rgba(16,18,40,.08),0_8px_24px_-6px_rgba(16,18,40,.4)]"
          >
            <svg
              aria-hidden="true"
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        </Overlay>
      </PigeonMap>
    </div>
  )
}
