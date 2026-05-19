import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

export function QuartiersHero({
  locale,
  quartiersCount,
  totalListings,
}: {
  locale: Locale
  quartiersCount: number
  totalListings: number
}) {
  const t = getT(locale)
  return (
    <section className="mx-auto grid max-w-6xl items-end gap-12 px-4 pt-16 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          {t('quartiers.eyebrow')}
        </span>
        <h1 className="mt-3.5 font-serif text-[clamp(36px,4.2vw,56px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
          {t('quartiers.h1')}
        </h1>
        <p className="mt-4 max-w-[540px] text-[17px] leading-[1.55] text-foreground/70">
          {t('quartiers.lead')}
        </p>
      </div>
      <div className="flex flex-wrap gap-10">
        <Stat n={String(quartiersCount)} label={t('quartiers.stats.quartiers.label')} />
        <Stat n={String(totalListings)} label={t('quartiers.stats.listings.label')} />
        <Stat
          n={t('quartiers.stats.priceRange.value')}
          label={t('quartiers.stats.priceRange.label')}
        />
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
