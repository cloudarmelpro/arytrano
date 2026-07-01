import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import { NeighborhoodMapClient } from './NeighborhoodMapClient'

/**
 * Server-side wrapper around the pigeon-maps Client island. Mirrors
 * the `QuartiersMap` pattern : direct import of the `'use client'`
 * module — no `next/dynamic`, no `ssr: false` (Next 16 forbids the
 * latter from Server Components anyway). The client directive itself
 * creates the SSR boundary.
 */
export function NeighborhoodMap({
  locale,
  lat,
  lng,
  label,
}: {
  locale: Locale
  lat: number
  lng: number
  label: string
}) {
  const t = getT(locale)
  return (
    <section className="bg-background py-12">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          {t('neighborhoodLanding.map.eyebrow')}
        </span>
        <h2 className="mt-2 mb-6 text-[clamp(24px,3vw,36px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
          {t('neighborhoodLanding.map.title')}
        </h2>
        <NeighborhoodMapClient lat={lat} lng={lng} label={label} />
      </div>
    </section>
  )
}
