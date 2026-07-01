import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

/**
 * Hero for `/villes/<citySlug>` city landing.
 *
 * SEO-critical : the H1 is the primary keyword target ("Logement
 * étudiant à {city}"). Keep it interpolated, never hardcoded, so
 * each city ranks for its own term.
 *
 * CTA points to `/annonces?city=<slug>` — the same city the visitor
 * just clicked on the CityTabs. The cross-link keeps the search-page
 * funnel coherent.
 */
export function CityHero({
  locale,
  cityName,
  citySlug,
  stats,
}: {
  locale: Locale
  cityName: string
  citySlug: string
  stats: {
    totalListings: number
    verifiedOwners: number
    neighborhoodsCount: number
  }
}) {
  const t = getT(locale)
  const isEmpty = stats.totalListings === 0
  return (
    <section className="bg-primary text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-20">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">
          {t('cityLanding.eyebrow')}
        </span>
        <h1 className="mt-3 text-[clamp(36px,5vw,68px)] font-normal leading-[1.04] tracking-[-0.02em] text-white">
          {t('cityLanding.title', { city: cityName })}
        </h1>
        <p className="mt-4 max-w-[640px] text-[17px] leading-[1.55] text-white/85">
          {isEmpty
            ? t('cityLanding.description.empty', { city: cityName })
            : t('cityLanding.description', { city: cityName })}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-5">
          <Stat
            n={String(stats.totalListings)}
            label={t('cityLanding.stats.activeListings')}
          />
          <Stat
            n={String(stats.neighborhoodsCount)}
            label={t('cityLanding.stats.neighborhoodsCount')}
          />
          <Stat
            n={String(stats.verifiedOwners)}
            label={t('cityLanding.stats.verifiedOwners')}
          />
        </div>

        {!isEmpty && (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/annonces?city=${citySlug}`}
              className="inline-flex h-12 items-center rounded-xl bg-white px-5 text-[14.5px] font-semibold text-primary transition hover:bg-[oklch(0.97_0.012_90)]"
            >
              {t('cityLanding.cta.searchListings', { city: cityName })}
            </Link>
            <Link
              href={`/quartiers/${citySlug}`}
              className="inline-flex h-12 items-center rounded-xl border border-white/40 bg-transparent px-5 text-[14.5px] font-semibold text-white transition hover:bg-white/10"
            >
              {t('cityLanding.cta.exploreQuartiers')}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-[32px] font-semibold leading-none text-white">
        {n}
      </div>
      <div className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-white/65">
        {label}
      </div>
    </div>
  )
}
