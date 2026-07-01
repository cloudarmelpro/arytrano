import type { Metadata } from 'next'
import Link from 'next/link'
import {
  listPublicListings,
  listPublicListingsForMap,
  listPublicListingsQuerySchema,
} from '@/features/listings/server'
import { PublicListingCard } from '@/features/listings'
import {
  ListingFiltersSidebar,
  ListingSortButtons,
  ActiveFiltersChips,
  ResultsSearchStrip,
  ListingsMapClient,
  ListingsViewToggle,
} from '@/features/listings'
import { SaveSearchButton } from '@/features/search'
import { listCitiesWithNeighborhoods } from '@/features/geo/server'
import { listUniversities } from '@/features/universities/server'
import { CompareFloatingBar } from '@/features/compare/components/CompareFloatingBar'
import { recordSearchQuery } from '@/features/search-analytics/services/record-search-query'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { listCitiesWithCounts } from '@/features/landing/server'
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
  q?: string
  view?: string
  nearUniversity?: string
  publishedSince?: string
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
      sp.amenities ||
      sp.q ||
      sp.view ||
      sp.nearUniversity ||
      sp.publishedSince,
  )
}

/**
 * Lookup a city's localized name by slug, for metadata + H1 interpolation.
 * Returns null when the slug doesn't match a seeded city — caller falls
 * back to the city-less generic title.
 *
 * Perf P1 : was a dedicated `prisma.city.findUnique` that ran on EVERY
 * filtered request, in addition to the parallel `listCitiesWithNeighborhoods`
 * in the page body. Now reads from the same cached call — React's
 * render-tree cache dedupes within a single request, so generateMetadata
 * + the page body share one query result.
 */
async function getCityLabel(
  citySlug: string | undefined,
  locale: string,
): Promise<string | null> {
  if (!citySlug) return null
  const cities = await listCitiesWithNeighborhoods()
  const city = cities.find((c) => c.slug === citySlug)
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
  const title = cityLabel
    ? t('annonces.title.city', { city: cityLabel })
    : t('annonces.title')
  const description = cityLabel
    ? t('annonces.metaDescription.city', { city: cityLabel })
    : t('annonces.metaDescription')
  return {
    title,
    description,
    // Consolidate paginated/filtered variants on the canonical landing URL.
    // `localeAlternates` adds the `/mg/annonces` hreflang.
    alternates: await localeAlternates('/annonces'),
    // Both paginated AND filtered variants must not be indexed independently —
    // we want Google's signal consolidated on `/annonces` + the listing detail pages.
    robots:
      isPaginated || isFiltered ? { index: false, follow: true } : undefined,
    // SEO audit fix (2026-06-12) — without an openGraph block, social
    // shares of /annonces (incl. ?city=) fell through to the static
    // brand card. The image inherits from root layout.
    openGraph: {
      title,
      description,
      url: '/annonces',
      type: 'website',
    },
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
    q: sp.q || undefined,
    nearUniversity: sp.nearUniversity || undefined,
    publishedSince: sp.publishedSince || undefined,
  })
  const query = parsed.success ? parsed.data : {}

  // Performance audit H-3 (2026-05-29) — gate the map query behind
  // `isMapView`. Pre-fix, `listPublicListingsForMap` ran on every
  // /annonces request (~500-row scan + neighborhood join), even though
  // the result is only consumed by the sidebar mini-map (grid view)
  // and the full map (map view). On mobile (<lg breakpoint) the
  // sidebar is hidden, so the mini-map's payload was wasted bytes
  // + DB time for every grid-view mobile load. We now fetch only
  // when the URL says `?view=map`; the sidebar mini-map is removed
  // from the grid view in exchange (users discover the map via the
  // ListingsViewToggle pill).
  const isMapView = sp.view === 'map'
  const [
    { items, nextCursor, hasMore },
    mapItems,
    cities,
    cityCounts,
    universities,
    session,
  ] = await Promise.all([
    listPublicListings(query),
    isMapView ? listPublicListingsForMap(query) : Promise.resolve([]),
    listCitiesWithNeighborhoods(),
    // CityTabs counts. Separate query (cached 5min) — `listCitiesWith
    // Neighborhoods` doesn't aggregate, and we don't want to fold the
    // count into it because that one is hit by the listing-form too
    // (no aggregate needed there).
    listCitiesWithCounts(),
    listUniversities(),
    auth(),
  ])

  // ANA-09 — non-blocking search analytics tracking. Only recorded
  // when the visitor actually typed something; drop paginated hits so
  // we don't count the same query N times.
  if (sp.q && !sp.cursor) {
    const h = await headers()
    const { ipHash } = extractRequestInfo(h)
    after(async () => {
      await recordSearchQuery({
        q: sp.q!,
        resultCount: items.length,
        ipHash,
      })
    })
  }

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

  // Build CityOption[] for the ResultsSearchStrip (city + nested
  // quartiers, localized). Same shape the landing hero uses.
  const cityOptions = cities.map((c) => ({
    slug: c.slug,
    label: locale === 'mg' ? c.nameMg : c.nameFr,
    neighborhoods: c.neighborhoods.map((n) => ({
      slug: n.slug,
      label: locale === 'mg' ? n.nameMg : n.nameFr,
    })),
  }))

  // Single SET lookup per card avoids N+1 favorite queries.
  const favoritedIds = await getFavoritedListingIds(
    session?.user?.id ?? null,
    items.map((l) => l.id),
  )
  const filterActive = hasAnyFilter(sp)
  // E-T10 — `?view=map` switches the grid for a full-width map view.
  // Default (no `?view=`) stays grid so the SEO-indexable listing cards
  // remain the canonical content of /annonces.
  // (Note: `isMapView` is computed earlier so the parallel data fetch
  // can gate the map query behind it — see Performance audit H-3.)
  const buildPageHref = (cursor: string) => {
    const next = new URLSearchParams()
    if (sp.type) next.set('type', sp.type)
    if (sp.city) next.set('city', sp.city)
    if (sp.neighborhood) next.set('neighborhood', sp.neighborhood)
    if (sp.priceMin) next.set('priceMin', sp.priceMin)
    if (sp.priceMax) next.set('priceMax', sp.priceMax)
    if (sp.sort) next.set('sort', sp.sort)
    if (sp.amenities) next.set('amenities', sp.amenities)
    if (sp.q) next.set('q', sp.q)
    next.set('cursor', cursor)
    return `/annonces?${next.toString()}`
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-12 lg:px-10">
      <header className="mb-6 flex flex-col gap-3 pt-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground"
        >
          <Link href="/" className="transition hover:text-foreground">
            {t('common.home')}
          </Link>
          /
          <span className="text-foreground">{pageTitle}</span>
        </nav>
        {!filterActive && (
          <p className="max-w-2xl text-[14.5px] text-foreground/70">
            {t(items.length <= 1 ? 'annonces.count.one' : 'annonces.count.other', {
              count: items.length,
            })}{' '}
            {t('annonces.lead')}
          </p>
        )}
        <ActiveFiltersChips locale={locale} neighborhoods={neighborhoods} />
      </header>

      {/* Results search strip — city / quartier / keyword pivot row.
          2026-06-09 — keyword search merged into the strip (was the
          standalone `UnifiedToolbar` below); the three inputs now
          align on a single row. Type / chambres / sdb / meublé
          live in the sidebar via `ListingFiltersSidebar`. */}
      <ResultsSearchStrip cities={cityOptions} />

      {/* Two-column layout: sidebar (live map + filters) + results main.
          E-T10 — when ?view=map, swap the embedded sidebar map for a
          full-width map, hide the grid, keep the filters sidebar. */}
      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {!isMapView && mapItems.length > 0 ? (
            <ListingsMapClient
              locale={locale}
              listings={mapItems}
              aspectClassName="aspect-[16/10]"
            />
          ) : null}
          <ListingFiltersSidebar universities={universities} />
        </div>

        <main className="flex min-w-0 flex-col gap-4">
          {/* Results bar — count on left, view toggle + sort + save on right */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13.5px] text-foreground/70">
              {t(items.length <= 1 ? 'annonces.count.one' : 'annonces.count.other', {
                count: items.length,
              })}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <ListingsViewToggle view={isMapView ? 'map' : 'grid'} />
              {!isMapView ? <ListingSortButtons /> : null}
              <SaveSearchButton signedIn={Boolean(session?.user)} />
            </div>
          </div>
          {isMapView ? (
            mapItems.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-muted/30 p-12 text-center">
                <p className="text-base font-medium">
                  {t('annonces.map.empty')}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('annonces.empty.filtered.lead')}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border">
                <ListingsMapClient
                  locale={locale}
                  listings={mapItems}
                  aspectClassName="aspect-[16/12] sm:aspect-[16/9] lg:aspect-[16/8]"
                />
              </div>
            )
          ) : null}
          {/* Cards grid + pagination — hidden in map view. SEO still
              picks up the cards via the non-default `?view=grid` URL
              (canonical /annonces is the grid variant). */}
          {isMapView ? null : items.length === 0 ? (
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
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
      {/* TEN-01 — sticky comparator bar visible whenever localStorage has picks. */}
      <CompareFloatingBar />
    </div>
  )
}
