import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from '@/features/auth'
import {
  CityHero,
  CityListings,
  CityQuartiersGrid,
} from '@/features/cities'
import { getCityLandingData } from '@/features/cities/server'
import { getFavoritedListingIds } from '@/features/favorites/server'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'
import { BreadcrumbJsonLd } from '@/lib/seo/breadcrumb'
import { buildPlaceSchema, buildListingItemList } from '@/lib/seo/place-schema'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'
import { env } from '@/lib/env'

/**
 * City landing page (E-T11). Reachable from :
 *   - The hub /villes (future — list of all cities)
 *   - Internal links from listing detail pages, footer, sitemap
 *   - Direct from Google search ("logement étudiant Antananarivo")
 *
 * SEO-critical : the H1 is the keyword target, metadata describes the
 * inventory, structured data (future iteration) signals "Place" +
 * "ItemList" to Google. Cached 5 min via the upstream
 * `getCityLandingData` so concurrent crawlers + visitors don't slam
 * the DB.
 */
type Params = Promise<{ citySlug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { citySlug } = await params
  const data = await getCityLandingData(citySlug)
  if (!data) return {} // notFound surfaces in the page render below
  const locale = await getLocale()
  const t = getT(locale)
  const cityName = locale === 'mg' ? data.city.nameMg : data.city.nameFr
  return {
    title: t('cityLanding.meta.title', { city: cityName }),
    description: t('cityLanding.meta.description', {
      city: cityName,
      count: data.stats.totalListings,
    }),
    alternates: await localeAlternates(`/villes/${data.city.slug}`),
    openGraph: {
      title: t('cityLanding.meta.title', { city: cityName }),
      description: t('cityLanding.meta.description', {
        city: cityName,
        count: data.stats.totalListings,
      }),
      url: `/villes/${data.city.slug}`,
      type: 'website',
    },
  }
}

export default async function CityLandingPage({
  params,
}: {
  params: Params
}) {
  const { citySlug } = await params
  const [data, locale, session] = await Promise.all([
    getCityLandingData(citySlug),
    getLocale(),
    auth(),
  ])
  if (!data) notFound()
  const t = getT(locale)
  const cityName = locale === 'mg' ? data.city.nameMg : data.city.nameFr

  // Single SET lookup for the favorites button on each card.
  const favoritedIds = await getFavoritedListingIds(
    session?.user?.id ?? null,
    data.topListings.map((l) => l.id),
  )

  // SEO audit fix (2026-06-12) — emit Place + ItemList JSON-LD.
  // The city page is the higher-priority SEO target than its
  // neighborhood children ; without these the rich-result
  // eligibility for "logement étudiant <city>" queries was capped.
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const placeSchema = buildPlaceSchema({
    name: cityName,
    description: t('cityLanding.meta.description', {
      city: cityName,
      count: data.stats.totalListings,
    }),
    url: `${baseUrl}/villes/${data.city.slug}`,
    lat: data.city.lat,
    lng: data.city.lng,
    containedIn: [{ name: 'Madagascar', type: 'Country' }],
  })
  const itemListSchema =
    data.topListings.length > 0
      ? buildListingItemList({
          name: t('cityLanding.meta.title', { city: cityName }),
          itemListElement: data.topListings.map((l) => ({
            name: l.title,
            url: `${baseUrl}/${l.city.slug}/${l.neighborhood.slug}/${l.slug}`,
            priceMGA: l.priceMonthlyMGA,
          })),
        })
      : null

  return (
    <>
      <BreadcrumbJsonLd
        homeLabel={t('common.home')}
        trail={[{ name: cityName, href: `/villes/${data.city.slug}` }]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(placeSchema) }}
      />
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }}
        />
      )}
      <CityHero
        locale={locale}
        cityName={cityName}
        citySlug={data.city.slug}
        stats={data.stats}
      />
      <CityListings
        locale={locale}
        cityName={cityName}
        citySlug={data.city.slug}
        listings={data.topListings}
        total={data.stats.totalListings}
        favoritedIds={new Set(favoritedIds)}
        authenticated={Boolean(session?.user)}
      />
      <CityQuartiersGrid
        locale={locale}
        cityName={cityName}
        citySlug={data.city.slug}
        quartiers={data.neighborhoods.map((n) => ({
          slug: n.slug,
          nameFr: n.nameFr,
          nameMg: n.nameMg,
          listingCount: n.listingCount,
        }))}
      />
    </>
  )
}
