'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * TEN-10 — floating "Rechercher dans cette zone" button that appears
 * when the current map viewport differs meaningfully from the URL's
 * bbox param. Click pushes the new bbox to the URL and triggers an
 * RSC re-render with the constrained result set.
 *
 * The map component (ListingsMapClient) provides bounds via a
 * onBoundsChanged callback wired through a small event bus: we listen
 * on `window` for a custom `map:bounds` event that carries the four
 * corner coordinates. This avoids prop-drilling into pigeon-maps'
 * internals.
 */
type Bounds = { swLat: number; swLng: number; neLat: number; neLng: number }

export function MapSearchThisAreaButton() {
  const router = useRouter()
  const params = useSearchParams()
  const [bounds, setBounds] = useState<Bounds | null>(null)

  useEffect(() => {
    function onBounds(e: Event) {
      const detail = (e as CustomEvent<Bounds>).detail
      setBounds(detail)
    }
    window.addEventListener('arytrano:map-bounds', onBounds)
    return () => window.removeEventListener('arytrano:map-bounds', onBounds)
  }, [])

  const currentBbox = params.get('bbox')
  const nextBbox = bounds
    ? `${bounds.swLat.toFixed(5)},${bounds.swLng.toFixed(5)},${bounds.neLat.toFixed(5)},${bounds.neLng.toFixed(5)}`
    : null
  const changed = nextBbox !== null && nextBbox !== currentBbox

  if (!changed) return null

  return (
    <button
      type="button"
      onClick={() => {
        const next = new URLSearchParams(params)
        next.set('bbox', nextBbox!)
        next.delete('cursor')
        router.replace(`/annonces?${next.toString()}`, { scroll: false })
      }}
      className="absolute left-1/2 top-4 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:opacity-90"
    >
      <svg
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      Rechercher dans cette zone
    </button>
  )
}
