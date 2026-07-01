import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import { formatAriary } from '@/lib/format/currency'

/**
 * Quartier landing hero. Lighter visual than CityHero (background
 * stays neutral) so the quartier feels like a sub-section of the
 * city, not a standalone destination.
 *
 * Breadcrumb-style city link sits above the H1 — gives the SEO
 * crawler a clear hierarchy AND lets the visitor pop back up to the
 * city level in one click.
 */
export function NeighborhoodHero({
  locale,
  cityName,
  citySlug,
  quartierName,
  stats,
}: {
  locale: Locale
  cityName: string
  citySlug: string
  quartierName: string
  stats: {
    totalListings: number
    avgPriceMGA: number | null
    reviewCount: number
    avgRating: number | null
  }
}) {
  const t = getT(locale)
  const isEmpty = stats.totalListings === 0
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <Link
          href={`/villes/${citySlug}`}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary transition hover:opacity-80"
        >
          ← {cityName}
        </Link>
        <h1 className="mt-4 text-[clamp(36px,5vw,68px)] font-normal leading-[1.04] tracking-[-0.02em] text-foreground">
          {t('neighborhoodLanding.title', {
            quartier: quartierName,
            city: cityName,
          })}
        </h1>
        <p className="mt-4 max-w-[640px] text-[17px] leading-[1.55] text-foreground/70">
          {isEmpty
            ? t('neighborhoodLanding.description.empty', {
                quartier: quartierName,
                city: cityName,
              })
            : t('neighborhoodLanding.description', {
                quartier: quartierName,
                city: cityName,
                count: stats.totalListings,
              })}
        </p>

        {!isEmpty && (
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-5">
            <Stat
              n={String(stats.totalListings)}
              label={t('neighborhoodLanding.stats.listings')}
            />
            {stats.avgPriceMGA !== null && (
              <Stat
                n={formatAriary(stats.avgPriceMGA)}
                label={t('neighborhoodLanding.stats.avgPrice')}
              />
            )}
            {stats.reviewCount > 0 && stats.avgRating !== null && (
              <Stat
                n={`${stats.avgRating.toFixed(1)} / 5`}
                label={t('neighborhoodLanding.stats.reviews', {
                  count: stats.reviewCount,
                })}
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-[28px] font-semibold leading-none text-foreground">
        {n}
      </div>
      <div className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
    </div>
  )
}
