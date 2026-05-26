'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Map as PigeonMap, Overlay } from 'pigeon-maps'
import { cloudinaryPanelThumb } from '@/lib/images/cloudinary-transform'

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

export type MapListing = {
  id: string
  slug: string
  title: string
  priceMonthlyMGA: number
  citySlug: string
  neighborhoodSlug: string
  neighborhoodLat: number
  neighborhoodLng: number
  neighborhoodNameFr: string
  photoUrl: string | null
}

/**
 * Cluster-by-quartier map view for /annonces (E-T10).
 *
 * Pragmatic v1 : we don't ship a real lat/lng-based clustering
 * library (Supercluster, leaflet.markercluster). Instead we group
 * listings by neighborhood — every quartier shows ONE overlay pin
 * with the count, and clicking expands a list of the matching
 * listings. At Madagascar launch scale (50-200 listings spread
 * across 37 quartiers) this is the right trade-off : zero extra
 * bundle weight, no cluster-recalc on pan/zoom, and the grouping
 * matches how users mentally search ("quels logements à Anosy ?").
 *
 * Upgrade path : when we cross a few hundred listings per quartier,
 * swap the per-quartier group for a Supercluster pass that respects
 * the current zoom level.
 */
export function ListingsMapClient({
  locale,
  listings,
  aspectClassName,
}: {
  locale: 'fr-MG' | 'mg'
  listings: MapListing[]
  /** Override the default 16:8 aspect — used by the sidebar variant (square). */
  aspectClassName?: string
}) {
  const [openQuartier, setOpenQuartier] = useState<string | null>(null)
  // A11y — focus management on the slide-in panel. When a pin is
  // activated, focus moves to the close button so keyboard / screen-
  // reader users land inside the new context. Escape closes the panel
  // and returns focus to the pin button that opened it.
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const pinRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map())
  useEffect(() => {
    if (openQuartier) closeBtnRef.current?.focus()
  }, [openQuartier])
  function closePanel() {
    const slug = openQuartier
    setOpenQuartier(null)
    // Restore focus to the originating pin so keyboard users don't
    // get stranded on the body element.
    if (slug) {
      requestAnimationFrame(() => pinRefs.current.get(slug)?.focus())
    }
  }
  useEffect(() => {
    if (!openQuartier) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openQuartier])

  // Group by neighborhoodSlug — one Overlay per quartier with count.
  const groups = useMemo(() => {
    const map = new Map<
      string,
      {
        slug: string
        lat: number
        lng: number
        nameFr: string
        listings: MapListing[]
      }
    >()
    for (const l of listings) {
      const existing = map.get(l.neighborhoodSlug)
      if (existing) {
        existing.listings.push(l)
      } else {
        map.set(l.neighborhoodSlug, {
          slug: l.neighborhoodSlug,
          lat: l.neighborhoodLat,
          lng: l.neighborhoodLng,
          nameFr: l.neighborhoodNameFr,
          listings: [l],
        })
      }
    }
    return Array.from(map.values())
  }, [listings])

  // Center on the centroid of all listings (same trick as
  // QuartiersMapClient).
  const center: [number, number] = useMemo(() => {
    if (groups.length === 0) return [-21.4554, 47.0857]
    let sumLat = 0
    let sumLng = 0
    for (const g of groups) {
      sumLat += g.lat
      sumLng += g.lng
    }
    return [sumLat / groups.length, sumLng / groups.length]
  }, [groups])

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-border bg-muted ${
        aspectClassName ?? 'aspect-[16/8] max-[720px]:aspect-[4/3]'
      }`}
    >
      <PigeonMap
        key={`${Math.round(center[0] * 10)}:${Math.round(center[1] * 10)}`}
        defaultCenter={center}
        defaultZoom={12}
        minZoom={9}
        maxZoom={16}
        attributionPrefix={false}
        provider={STADIA_API_KEY ? stadiaTileProvider : undefined}
        attribution={
          // A11y — every `target="_blank"` link declares its
          // out-of-context navigation via aria-label so screen-reader
          // users hear "(opens in new tab)" before activating.
          <span className="font-sans text-[10.5px]">
            {STADIA_API_KEY ? (
              <>
                ©{' '}
                <a
                  href="https://stadiamaps.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  aria-label={locale === 'mg' ? 'Stadia Maps (misokatra amin\'ny pejy vaovao)' : 'Stadia Maps (nouvel onglet)'}
                >
                  Stadia Maps
                </a>
                {' '}©{' '}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  aria-label={locale === 'mg' ? 'OpenStreetMap (misokatra amin\'ny pejy vaovao)' : 'OpenStreetMap (nouvel onglet)'}
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
                  aria-label={locale === 'mg' ? 'OpenStreetMap (misokatra amin\'ny pejy vaovao)' : 'OpenStreetMap (nouvel onglet)'}
                >
                  OpenStreetMap
                </a>
              </>
            )}
          </span>
        }
      >
        {groups.map((g) => {
          const open = openQuartier === g.slug
          return (
            <Overlay
              key={g.slug}
              anchor={[g.lat, g.lng]}
              offset={[24, 24]}
            >
              <button
                type="button"
                ref={(el) => {
                  pinRefs.current.set(g.slug, el)
                }}
                onClick={() => setOpenQuartier(open ? null : g.slug)}
                aria-expanded={open}
                aria-controls={open ? 'listings-map-panel' : undefined}
                aria-label={`${g.nameFr} : ${g.listings.length} ${locale === 'mg' ? 'filazana' : 'annonces'}`}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-bold shadow-[0_1px_2px_rgba(16,18,40,.06),0_8px_20px_-8px_rgba(16,18,40,.3)] transition ${
                  open
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white text-foreground hover:scale-105'
                }`}
              >
                <span>{g.nameFr}</span>
                <span
                  className={`rounded-full px-1.5 text-[11px] ${
                    open
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {g.listings.length}
                </span>
              </button>
            </Overlay>
          )
        })}
      </PigeonMap>

      {/* Slide-in details panel when a quartier pin is clicked */}
      {openQuartier &&
        (() => {
          const group = groups.find((g) => g.slug === openQuartier)
          if (!group) return null
          return (
            <div
              id="listings-map-panel"
              role="dialog"
              aria-label={group.nameFr}
              className="absolute bottom-4 left-4 right-4 max-h-[60%] overflow-y-auto rounded-xl bg-white p-4 shadow-xl ring-1 ring-foreground/10 max-w-md sm:left-auto"
            >
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="text-[15px] font-bold text-foreground">
                  {group.nameFr}{' '}
                  <span className="font-mono text-[12px] text-muted-foreground">
                    {group.listings.length}
                  </span>
                </h3>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closePanel}
                  // 32x32 px target + visible focus ring — matches the
                  // 44 px guidance after factoring in the surrounding
                  // padding row.
                  className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-label={locale === 'mg' ? 'Hidio' : 'Fermer'}
                >
                  ✕
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {group.listings.slice(0, 6).map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/${l.citySlug}/${l.neighborhoodSlug}/${l.slug}`}
                      className="flex items-center gap-3 rounded-md p-1.5 transition hover:bg-muted/60"
                    >
                      {l.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cloudinaryPanelThumb(l.photoUrl)}
                          alt=""
                          width={48}
                          height={48}
                          loading="lazy"
                          className="h-12 w-12 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <span className="h-12 w-12 shrink-0 rounded-md bg-muted" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-foreground">
                          {l.title}
                        </span>
                        <span
                          className="block font-mono text-[12px] text-primary"
                          // Intl.NumberFormat('fr-FR') uses U+202F as
                          // thousands separator and screen readers
                          // typically read it as a stream of digits.
                          // Provide an explicit aria-label that reads
                          // the value naturally with the currency
                          // expanded.
                          aria-label={`${l.priceMonthlyMGA} ariary ${locale === 'mg' ? 'isam-bolana' : 'par mois'}`}
                        >
                          <span aria-hidden="true">
                            {l.priceMonthlyMGA.toLocaleString('fr-FR')} Ar
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {group.listings.length > 6 && (
                <p className="mt-2 text-[12px] text-muted-foreground">
                  +{group.listings.length - 6}{' '}
                  {locale === 'mg' ? 'maro hafa' : 'autres'}
                </p>
              )}
            </div>
          )
        })()}
    </div>
  )
}
