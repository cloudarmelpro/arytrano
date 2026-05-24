'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

// Tile provider (AUD-008). When the Stadia API key is set, point
// Leaflet at Stadia's commercial endpoint (200k tile views/mo free).
// Without a key, we fall back to the raw OSM apex — fine for dev,
// rate-limited at commercial scale.
const STADIA_API_KEY = process.env.NEXT_PUBLIC_STADIA_API_KEY
const STADIA_STYLE = process.env.NEXT_PUBLIC_STADIA_STYLE ?? 'alidade_smooth'

/**
 * Map showing a listing's approximate location.
 *
 * Privacy: we DON'T render an exact pin — instead, a 200m radius circle
 * centered on the listing's coordinates. The visitor sees the neighborhood
 * context (streets, nearby landmarks) without learning the exact building.
 *
 * Implementation notes:
 *  - Vanilla `leaflet` (not react-leaflet) to keep the bundle slim — every KB
 *    matters on 3G Madagascar (~40KB gzipped vs +10KB for react-leaflet).
 *  - Dynamic import in a `useEffect` so SSR doesn't try to access `window`.
 *  - OSM tiles (no API key, free, attribution required by ODbL).
 */
export function ListingMap({
  lat,
  lng,
  ariaLabel,
}: {
  lat: number
  lng: number
  ariaLabel: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Track the map instance so we can clean up on unmount.
  const mapRef = useRef<{ remove: () => void } | null>(null)

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) return

    // Dynamic import: Leaflet touches `window` at module-eval time, so it
    // can't be statically imported in a Server Component subtree.
    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 15,
        // Touch-pan is fine but we disable scroll-wheel zoom — visitors
        // scrolling the page should never accidentally zoom the map.
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      })

      const retina = window.devicePixelRatio >= 2 ? '@2x' : ''
      const tileUrl = STADIA_API_KEY
        ? `https://tiles.stadiamaps.com/tiles/${STADIA_STYLE}/{z}/{x}/{y}${retina}.png?api_key=${STADIA_API_KEY}`
        : `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
      const attribution = STADIA_API_KEY
        ? '© <a href="https://stadiamaps.com/">Stadia Maps</a> © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution,
      }).addTo(map)

      L.circle([lat, lng], {
        radius: 200,
        // Use the brand indigo with low fill opacity — visible but soft.
        color: '#4F46E5',
        weight: 2,
        fillColor: '#4F46E5',
        fillOpacity: 0.15,
      }).addTo(map)

      mapRef.current = map
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [lat, lng])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className="h-56 w-full overflow-hidden rounded-xl border border-border bg-muted sm:h-60"
    />
  )
}
