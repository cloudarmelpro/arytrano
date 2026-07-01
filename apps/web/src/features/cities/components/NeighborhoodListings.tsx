import Link from 'next/link'
import { PublicListingCard } from '@/features/listings'
import type { PublicListingCardData } from '@/features/listings'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

/**
 * Listings rail on a neighborhood landing page. Larger than the city
 * version (12 vs 8 cards) because the page is more focused — the
 * visitor is one click away from picking. The "Voir tout" CTA scopes
 * `/annonces` by city + neighborhood, preserving the filter.
 *
 * Empty state has a stronger CTA — "Sois le premier à publier" —
 * because owners in under-served quartiers are part of the audience
 * we're trying to convert.
 */
export function NeighborhoodListings({
  locale,
  citySlug,
  neighborhoodSlug,
  quartierName,
  listings,
  total,
  favoritedIds,
  authenticated,
}: {
  locale: Locale
  citySlug: string
  neighborhoodSlug: string
  quartierName: string
  listings: PublicListingCardData[]
  total: number
  favoritedIds: Set<string>
  authenticated: boolean
}) {
  const t = getT(locale)
  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
              {t('neighborhoodLanding.listings.eyebrow')}
            </span>
            <h2 className="mt-2 text-[clamp(26px,3.2vw,40px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
              {t('neighborhoodLanding.listings.title', {
                count: total,
                quartier: quartierName,
              })}
            </h2>
          </div>
          {total > listings.length && (
            <Link
              href={`/annonces?city=${citySlug}&neighborhood=${neighborhoodSlug}`}
              className="inline-flex h-10 items-center rounded-xl bg-background px-4 text-[13.5px] font-semibold text-foreground transition hover:bg-background/60"
            >
              {t('neighborhoodLanding.listings.viewAll', { total })}
            </Link>
          )}
        </header>

        {listings.length === 0 ? (
          <div className="rounded-2xl bg-background p-10 text-center">
            <p className="text-[15px] font-semibold text-foreground">
              {t('neighborhoodLanding.listings.empty.title', {
                quartier: quartierName,
              })}
            </p>
            <p className="mx-auto mt-2 max-w-[480px] text-[14px] leading-[1.5] text-foreground/70">
              {t('neighborhoodLanding.listings.empty.lead')}
            </p>
            <Link
              href="/dashboard/listings/new"
              className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-[14px] font-semibold text-primary-foreground transition hover:opacity-95"
            >
              {t('neighborhoodLanding.listings.empty.cta')}
            </Link>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        )}
      </div>
    </section>
  )
}
