import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/features/auth'
import {
  NeighborhoodHero,
  NeighborhoodMap,
  NeighborhoodListings,
  NeighborhoodReviews,
  NeighborhoodEditorial,
} from '@/features/cities'
import { getNeighborhoodLandingData } from '@/features/cities/server'
import { getFavoritedListingIds } from '@/features/favorites/server'
import { env } from '@/lib/env'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'
import { BreadcrumbJsonLd } from '@/lib/seo/breadcrumb'
import { buildPlaceSchema, buildListingItemList } from '@/lib/seo/place-schema'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'

type Params = Promise<{ citySlug: string; neighborhoodSlug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { citySlug, neighborhoodSlug } = await params
  const data = await getNeighborhoodLandingData(citySlug, neighborhoodSlug)
  if (!data) return {}
  const locale = await getLocale()
  const t = getT(locale)
  const cityName = locale === 'mg' ? data.city.nameMg : data.city.nameFr
  const quartierName =
    locale === 'mg' ? data.neighborhood.nameMg : data.neighborhood.nameFr
  const title = t('neighborhoodLanding.meta.title', {
    quartier: quartierName,
    city: cityName,
  })
  const description = t('neighborhoodLanding.meta.description', {
    quartier: quartierName,
    city: cityName,
    count: data.stats.totalListings,
  })
  return {
    title,
    description,
    alternates: await localeAlternates(
      `/villes/${data.city.slug}/quartiers/${data.neighborhood.slug}`,
    ),
    openGraph: {
      title,
      description,
      url: `/villes/${data.city.slug}/quartiers/${data.neighborhood.slug}`,
      type: 'website',
    },
  }
}

export default async function NeighborhoodLandingPage({
  params,
}: {
  params: Params
}) {
  const { citySlug, neighborhoodSlug } = await params
  const [data, locale, session] = await Promise.all([
    getNeighborhoodLandingData(citySlug, neighborhoodSlug),
    getLocale(),
    auth(),
  ])
  if (!data) notFound()
  const t = getT(locale)
  const cityName = locale === 'mg' ? data.city.nameMg : data.city.nameFr
  const quartierName =
    locale === 'mg' ? data.neighborhood.nameMg : data.neighborhood.nameFr

  const favoritedIds = await getFavoritedListingIds(
    session?.user?.id ?? null,
    data.listings.map((l) => l.id),
  )

  // SEO structured data : Place hierarchy + ItemList of listings.
  // Place tells Google "this URL is a geographic entity with these
  // coordinates"; ItemList surfaces the inventory count in rich
  // results. Both are inlined as JSON-LD <script>.
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const placeSchema = buildPlaceSchema({
    name: `${quartierName}, ${cityName}`,
    description: t('neighborhoodLanding.meta.description', {
      quartier: quartierName,
      city: cityName,
      count: data.stats.totalListings,
    }),
    url: `${baseUrl}/villes/${data.city.slug}/quartiers/${data.neighborhood.slug}`,
    lat: data.neighborhood.lat,
    lng: data.neighborhood.lng,
    containedIn: [
      { name: cityName, type: 'AdministrativeArea' },
      { name: 'Madagascar', type: 'Country' },
    ],
  })
  const itemListSchema =
    data.listings.length > 0
      ? buildListingItemList({
          name: t('neighborhoodLanding.meta.title', {
            quartier: quartierName,
            city: cityName,
          }),
          itemListElement: data.listings.map((l) => ({
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
        trail={[
          { name: cityName, href: `/villes/${data.city.slug}` },
          {
            name: quartierName,
            href: `/villes/${data.city.slug}/quartiers/${data.neighborhood.slug}`,
          },
        ]}
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

      <NeighborhoodHero
        locale={locale}
        cityName={cityName}
        citySlug={data.city.slug}
        quartierName={quartierName}
        stats={data.stats}
      />
      {/* CON-03 — editorial body for SEO long-tail. Renders nothing when
          the Json column is empty, so existing untouched quartiers stay
          unaffected. */}
      <NeighborhoodEditorial
        locale={locale}
        editorial={data.neighborhood.editorial}
        quartierName={quartierName}
        cityName={cityName}
      />
      <NeighborhoodMap
        locale={locale}
        lat={data.neighborhood.lat}
        lng={data.neighborhood.lng}
        label={quartierName}
      />
      <NeighborhoodListings
        locale={locale}
        citySlug={data.city.slug}
        neighborhoodSlug={data.neighborhood.slug}
        quartierName={quartierName}
        listings={data.listings}
        total={data.stats.totalListings}
        favoritedIds={new Set(favoritedIds)}
        authenticated={Boolean(session?.user)}
      />
      <NeighborhoodReviews
        locale={locale}
        quartierName={quartierName}
        count={data.stats.reviewCount}
        averageRating={data.stats.avgRating}
      />

      {data.siblings.length > 0 && (
        <section className="bg-background py-12">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <h2 className="mb-4 text-[clamp(20px,2.4vw,28px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
              {t('neighborhoodLanding.siblings.title', { city: cityName })}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {data.siblings.map((s) => {
                const label = locale === 'mg' ? s.nameMg : s.nameFr
                return (
                  <li key={s.slug}>
                    <Link
                      href={`/villes/${data.city.slug}/quartiers/${s.slug}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-[13px] font-semibold text-foreground transition hover:bg-muted"
                    >
                      <span>{label}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {s.listingCount}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
