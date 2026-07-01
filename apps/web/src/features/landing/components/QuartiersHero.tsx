import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

/**
 * Quartiers index hero — adapts to the city in the route :
 *   - non-empty city : "{N} quartiers de {City}" + lead générique
 *   - empty city (seeded but no quartiers yet, edge case) : "Bientôt
 *     à {City}" + lead inviting to come back later
 *
 * The static `priceRange` stat from v0.5 was dropped — it hardcoded
 * "95k-420k" Fianar-specific values and would mislead visitors on
 * other cities. The 2 remaining stats (quartiers count + active
 * listings) are real-time accurate for every city.
 */
export function QuartiersHero({
  locale,
  cityName,
  quartiersCount,
  totalListings,
}: {
  locale: Locale
  /** Localized city name shown in the H1 interpolation. */
  cityName: string
  quartiersCount: number
  totalListings: number
}) {
  const t = getT(locale)
  const isEmpty = quartiersCount === 0
  return (
    <section className="bg-background pt-10 pb-10">
      <div className="mx-auto grid max-w-[1280px] items-end gap-12 px-6 lg:grid-cols-[1.5fr_1fr] lg:px-10">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('quartiers.eyebrow')}
          </span>
          <h1 className="mt-3.5 text-[clamp(36px,4.2vw,56px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {isEmpty
              ? t('quartiers.h1.empty', { city: cityName })
              : t('quartiers.h1', { count: quartiersCount, city: cityName })}
          </h1>
          <p className="mt-4 max-w-[540px] text-[17px] leading-[1.55] text-foreground/70">
            {isEmpty
              ? t('quartiers.lead.empty', { city: cityName })
              : t('quartiers.lead')}
          </p>
        </div>
        {!isEmpty && (
          <div className="flex flex-wrap gap-10">
            <Stat
              n={String(quartiersCount)}
              label={t('quartiers.stats.quartiers.label')}
            />
            <Stat
              n={String(totalListings)}
              label={t('quartiers.stats.listings.label')}
            />
          </div>
        )}
      </div>
    </section>
  )
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-[32px] font-bold leading-none tracking-[-0.025em] text-foreground">
        {n}
      </div>
      <div className="mt-1.5 text-[12.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
    </div>
  )
}
