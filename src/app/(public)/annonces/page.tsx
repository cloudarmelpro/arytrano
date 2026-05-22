import type { Metadata } from 'next'
import Link from 'next/link'
import {
  listPublicListings,
  listPublicListingsQuerySchema,
} from '@/features/listings/server'
import { PublicListingCard } from '@/features/listings'
import {
  ListingFiltersSidebar,
  ListingSearchToolbar,
  CityTabs,
} from '@/features/listings'
import { SaveSearchButton } from '@/features/search'
import { listCitiesWithNeighborhoods } from '@/features/geo'
import { listCitiesWithCounts } from '@/features/landing/server'
import { prisma } from '@/lib/db'
import { getFavoritedListingIds } from '@/features/favorites/server'
import { auth } from '@/features/auth'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'
import { Icon } from '@/components/shared/Icon'

type SearchParams = Promise<{
  cursor?: string
  type?: string
  city?: string
  neighborhood?: string
  priceMin?: string
  priceMax?: string
  sort?: string
  amenities?: string
}>

function hasAnyFilter(sp: Awaited<SearchParams>) {
  // `sort` counts as a filter variant for SEO purposes — we want sorted URLs
  // noindexed and canonical to /annonces too. Otherwise both ?sort=price-asc
  // and ?sort=price-desc would be independently indexable.
  return Boolean(
    sp.type ||
      sp.city ||
      sp.neighborhood ||
      sp.priceMin ||
      sp.priceMax ||
      sp.sort ||
      sp.amenities,
  )
}

/**
 * Lookup a city's localized name by slug, for metadata + H1 interpolation.
 * Returns null when the slug doesn't match a seeded city — caller falls
 * back to the city-less generic title.
 */
async function getCityLabel(
  citySlug: string | undefined,
  locale: string,
): Promise<string | null> {
  if (!citySlug) return null
  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
    select: { nameFr: true, nameMg: true },
  })
  if (!city) return null
  return locale === 'mg' ? city.nameMg : city.nameFr
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const [sp, locale] = await Promise.all([searchParams, getLocale()])
  const t = getT(locale)
  const isPaginated = Boolean(sp.cursor)
  const isFiltered = hasAnyFilter(sp)
  const cityLabel = await getCityLabel(sp.city, locale)
  return {
    title: cityLabel
      ? t('annonces.title.city', { city: cityLabel })
      : t('annonces.title'),
    description: cityLabel
      ? t('annonces.metaDescription.city', { city: cityLabel })
      : t('annonces.metaDescription'),
    // Consolidate paginated/filtered variants on the canonical landing URL.
    // `localeAlternates` adds the `/mg/annonces` hreflang.
    alternates: await localeAlternates('/annonces'),
    // Both paginated AND filtered variants must not be indexed independently —
    // we want Google's signal consolidated on `/annonces` + the listing detail pages.
    robots:
      isPaginated || isFiltered ? { index: false, follow: true } : undefined,
  }
}

export default async function PublicListingsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [sp, locale] = await Promise.all([searchParams, getLocale()])
  const t = getT(locale)
  const parsed = listPublicListingsQuerySchema.safeParse({
    cursor: sp.cursor,
    type: sp.type || undefined,
    city: sp.city || undefined,
    neighborhood: sp.neighborhood || undefined,
    priceMin: sp.priceMin || undefined,
    priceMax: sp.priceMax || undefined,
    sort: sp.sort || undefined,
    amenities: sp.amenities || undefined,
  })
  const query = parsed.success ? parsed.data : {}

  // Fetch the listings + neighborhood list + session in parallel —
  // neighborhoods power the filter dropdown, listings are the page payload,
  // and the session lets us mark already-favorited cards.
  const [
    { items, nextCursor, hasMore },
    cities,
    cityCounts,
    session,
  ] = await Promise.all([
    listPublicListings(query),
    listCitiesWithNeighborhoods(),
    // CityTabs counts. Separate query (cached 5min) — `listCitiesWith
    // Neighborhoods` doesn't aggregate, and we don't want to fold the
    // count into it because that one is hit by the listing-form too
    // (no aggregate needed there).
    listCitiesWithCounts(),
    auth(),
  ])

  // Merge counts into the cities list — order follows `listCitiesWith
  // Neighborhoods` (alphabetical) for stable tab order across renders.
  const countBySlug = new Map(cityCounts.map((c) => [c.slug, c.listingCount]))
  const cityTabs = cities.map((c) => ({
    slug: c.slug,
    nameFr: c.nameFr,
    nameMg: c.nameMg,
    count: countBySlug.get(c.slug) ?? 0,
  }))
  const totalListingCount = cityTabs.reduce((sum, c) => sum + c.count, 0)
  // E-T07 multi-ville : show neighborhoods of the city in `?city=` if
  // passed, otherwise flatten ALL cities' neighborhoods so the filter
  // dropdown remains useful when the visitor hasn't picked a city.
  // When city IS in the URL but unknown, fall through to first city
  // as a defensive default.
  const activeCity = sp.city
    ? (cities.find((c) => c.slug === sp.city) ?? cities[0])
    : null
  const neighborhoods = activeCity
    ? activeCity.neighborhoods
    : cities.flatMap((c) => c.neighborhoods)

  // Page H1 + breadcrumb adapt to the city filter so visitors who land
  // here via `?city=antananarivo` don't see a misleading "Annonces à
  // Fianarantsoa" hardcoded headline.
  const pageTitle = activeCity
    ? t('annonces.title.city', {
        city: locale === 'mg' ? activeCity.nameMg : activeCity.nameFr,
      })
    : t('annonces.title')

  // CityTabs preserves the user's other filters (type, price, sort,
  // amenities) but drops `city`, `neighborhood`, and `cursor` — the
  // pill itself sets the city and pagination/neighborhood scoping
  // belongs to the new city, not the previous one.
  const cityTabsParams = new URLSearchParams()
  if (sp.type) cityTabsParams.set('type', sp.type)
  if (sp.priceMin) cityTabsParams.set('priceMin', sp.priceMin)
  if (sp.priceMax) cityTabsParams.set('priceMax', sp.priceMax)
  if (sp.sort) cityTabsParams.set('sort', sp.sort)
  if (sp.amenities) cityTabsParams.set('amenities', sp.amenities)

  // Single SET lookup per card avoids N+1 favorite queries.
  const favoritedIds = await getFavoritedListingIds(
    session?.user?.id ?? null,
    items.map((l) => l.id),
  )
  const filterActive = hasAnyFilter(sp)
  const buildPageHref = (cursor: string) => {
    const next = new URLSearchParams()
    if (sp.type) next.set('type', sp.type)
    if (sp.city) next.set('city', sp.city)
    if (sp.neighborhood) next.set('neighborhood', sp.neighborhood)
    if (sp.priceMin) next.set('priceMin', sp.priceMin)
    if (sp.priceMax) next.set('priceMax', sp.priceMax)
    if (sp.sort) next.set('sort', sp.sort)
    if (sp.amenities) next.set('amenities', sp.amenities)
    next.set('cursor', cursor)
    return `/annonces?${next.toString()}`
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-10">
      <header className="mb-8 flex flex-col gap-3">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground"
        >
          <Link href="/" className="transition hover:text-foreground">
            {t('common.appName')}
          </Link>
          <Icon name="arrow-right" size={11} />
          <span className="text-foreground">{pageTitle}</span>
        </nav>
        <h1 className="font-serif text-[clamp(32px,3.8vw,52px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
          {pageTitle}
        </h1>
        <p className="max-w-2xl text-[14.5px] text-foreground/70">
          <strong className="text-foreground">{items.length}</strong>{' '}
          {t(items.length <= 1 ? 'annonces.count.one' : 'annonces.count.other', {
            count: items.length,
          })}{' '}
          {filterActive ? null : t('annonces.lead')}
        </p>
      </header>

      {/* City pills row (E-T07). Lets a visitor switch city filter in
          one click without touching URL params. The "Tous" pill clears
          ?city= ; clicking another city replaces it AND drops the
          stale neighborhood slug (neighborhood slugs are unique per
          city — keeping one across city change would produce zero
          results). */}
      <CityTabs
        locale={locale}
        cities={cityTabs}
        activeCitySlug={activeCity?.slug ?? null}
        totalCount={totalListingCount}
        currentParams={cityTabsParams}
      />

      {/* Top toolbar — neighborhood autocomplete on the left, sort on
          the right + Save search dialog on the far right (E-T09). */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ListingSearchToolbar neighborhoods={neighborhoods} />
        <SaveSearchButton signedIn={Boolean(session?.user)} />
      </div>

      {/* Two-column layout: filters sidebar + results main */}
      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <ListingFiltersSidebar />

        <main className="flex min-w-0 flex-col gap-4">
          {items.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-muted/30 p-12 text-center">
              <p className="text-base font-medium">
                {filterActive
                  ? t('annonces.empty.filtered.title')
                  : activeCity
                    ? t('annonces.empty.title.city', {
                        city:
                          locale === 'mg'
                            ? activeCity.nameMg
                            : activeCity.nameFr,
                      })
                    : t('annonces.empty.title')}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {filterActive
                  ? t('annonces.empty.filtered.lead')
                  : t('annonces.empty.lead')}
              </p>
            </div>
          ) : (
            <>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {items.map((l, i) => (
                  // Priority on the first card only (no cursor = page 1 = LCP candidate).
                  <PublicListingCard
                    key={l.id}
                    listing={l}
                    t={t}
                    priority={i === 0 && !sp.cursor}
                    authenticated={Boolean(session?.user)}
                    initialFavorited={favoritedIds.has(l.id)}
                  />
                ))}
              </ul>

              {hasMore && nextCursor && (
                <nav className="mt-6 flex justify-center" aria-label="Pagination">
                  <Link
                    href={buildPageHref(nextCursor)}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium transition hover:bg-muted"
                  >
                    {t('annonces.pagination.next')}
                  </Link>
                </nav>
              )}

              {sp.cursor && (
                <div className="mt-1 flex justify-center">
                  <Link
                    href="/annonces"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {t('annonces.pagination.backToStart')}
                  </Link>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
