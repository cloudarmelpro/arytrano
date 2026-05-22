import dynamic from 'next/dynamic'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

// pigeon-maps reads `window` at module-eval time → must stay
// client-side. Dynamic import with `ssr: false` mirrors the
// QuartiersMap pattern.
const NeighborhoodMapClient = dynamic(
  () =>
    import('./NeighborhoodMapClient').then((m) => ({
      default: m.NeighborhoodMapClient,
    })),
  { ssr: false },
)

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
        <h2 className="mt-2 mb-6 font-serif text-[clamp(24px,3vw,36px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
          {t('neighborhoodLanding.map.title')}
        </h2>
        <NeighborhoodMapClient lat={lat} lng={lng} label={label} />
      </div>
    </section>
  )
}
