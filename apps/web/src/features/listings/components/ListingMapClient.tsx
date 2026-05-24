'use client'

import dynamic from 'next/dynamic'

/**
 * Client-only wrapper that dynamically imports the real `ListingMap`
 * (which depends on `leaflet` + its CSS — ~42 KB gzipped JS plus
 * stylesheet). Splitting it out keeps the listing-detail initial chunk
 * lean on Madagascar 3G; Leaflet only loads after hydration when the
 * map enters the page.
 *
 * `ssr: false` because Leaflet touches `window` at module evaluation;
 * skipping SSR avoids a duplicate hydration render where the placeholder
 * mismatches the post-load DOM.
 */
const ListingMap = dynamic(
  () => import('./ListingMap').then((m) => ({ default: m.ListingMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full animate-pulse rounded-xl bg-muted sm:h-80" />
    ),
  },
)

export function ListingMapClient(props: {
  lat: number
  lng: number
  ariaLabel: string
}) {
  return <ListingMap {...props} />
}
