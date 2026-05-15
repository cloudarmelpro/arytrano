'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

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

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
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
