import Link from 'next/link'
import { PublicListingCard } from '@/features/listings'
import type { PublicListingCardData } from '@/features/listings'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

/**
 * "Top annonces" rail on the city landing page. Renders the freshest
 * N listings (passed by the query) using the public card. Includes a
 * "Voir tout" link that scopes /annonces by city — closes the funnel
 * landing → search-results without losing the city filter.
 */
export function CityListings({
  locale,
  cityName,
  citySlug,
  listings,
  total,
  favoritedIds,
  authenticated,
}: {
  locale: Locale
  cityName: string
  citySlug: string
  listings: PublicListingCardData[]
  total: number
  favoritedIds: Set<string>
  authenticated: boolean
}) {
  const t = getT(locale)
  if (listings.length === 0) return null

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
              {t('cityLanding.listings.eyebrow')}
            </span>
            <h2 className="mt-2 text-[clamp(28px,3.4vw,42px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
              {t('cityLanding.listings.title', { city: cityName })}
            </h2>
            <p className="mt-2 text-[14.5px] text-foreground/70">
              {t('cityLanding.listings.lead', { total })}
            </p>
          </div>
          {total > listings.length && (
            <Link
              href={`/annonces?city=${citySlug}`}
              className="inline-flex h-10 items-center rounded-xl bg-muted/60 px-4 text-[13.5px] font-semibold text-foreground transition hover:bg-muted"
            >
              {t('cityLanding.listings.viewAll', { total })}
            </Link>
          )}
        </header>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((listing) => (
            <PublicListingCard
              key={listing.id}
              listing={listing}
              t={t}
              authenticated={authenticated}
              initialFavorited={favoritedIds.has(listing.id)}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}
