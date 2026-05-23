import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { QuartierDetailMap } from '@/features/landing'
import { PublicListingCard } from '@/features/listings'
import { getQuartierDetail } from '@/features/landing/server'
import { QUARTIER_DESCRIPTORS } from '@/features/landing/quartier-descriptors'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'
import { BreadcrumbJsonLd } from '@/lib/seo/breadcrumb'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'
import { formatAriary } from '@/lib/format/currency'
import { env } from '@/lib/env'
import { Icon } from '@/components/shared/Icon'

type Params = Promise<{ citySlug: string; quartierSlug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { citySlug, quartierSlug } = await params
  const data = await getQuartierDetail(citySlug, quartierSlug)
  if (!data) {
    // notFound() in metadata still surfaces — fall back to a generic
    // robots: noindex to keep crawlers off bad URLs even if the page
    // body 404s correctly.
    return { robots: { index: false, follow: false } }
  }
  const locale = await getLocale()
  const t = getT(locale)
  const quartierName =
    locale === 'mg' ? data.neighborhood.nameMg : data.neighborhood.nameFr
  const cityName = locale === 'mg' ? data.city.nameMg : data.city.nameFr
  const title = t('quartiers.detail.meta.title', {
    quartier: quartierName,
    city: cityName,
  })
  const description =
    data.publishedListings > 0
      ? t('quartiers.detail.meta.description', {
          quartier: quartierName,
          city: cityName,
          count: String(data.publishedListings),
        })
      : t('quartiers.detail.meta.description.empty', {
          quartier: quartierName,
          city: cityName,
        })
  return {
    title,
    description,
    alternates: await localeAlternates(
      `/quartiers/${citySlug}/${quartierSlug}`,
    ),
    openGraph: {
      title,
      description,
      url: `/quartiers/${citySlug}/${quartierSlug}`,
      type: 'website',
    },
  }
}

export default async function QuartierDetailPage({
  params,
}: {
  params: Params
}) {
  const { citySlug, quartierSlug } = await params
  const data = await getQuartierDetail(citySlug, quartierSlug)
  if (!data) notFound()
  const locale = await getLocale()
  const t = getT(locale)
  const quartierName =
    locale === 'mg' ? data.neighborhood.nameMg : data.neighborhood.nameFr
  const cityName = locale === 'mg' ? data.city.nameMg : data.city.nameFr

  // Descriptor exists for the 8 seeded Fianarantsoa quartiers. For
  // multi-city quartiers (Antananarivo, Toamasina, etc.) it's null
  // and we render a graceful empty-description state.
  const descriptor = QUARTIER_DESCRIPTORS[data.neighborhood.slug] ?? null

  // Compose URL to /annonces filtered by this city+neighborhood —
  // used in the "view all listings" CTA. The grid view there honors
  // the same filters and re-uses the existing PublicListingCard.
  const annoncesHref = `/annonces?city=${citySlug}&neighborhood=${quartierSlug}`

  // Place JSON-LD — communicates the geo + locality to Google so
  // long-tail searches like "logement andrainjato fianarantsoa" can
  // surface this page over the bare /annonces filter URL.
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const placeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: quartierName,
    description:
      descriptor && descriptor.ambiance
        ? t(descriptor.ambiance)
        : `${quartierName}, ${cityName}`,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: data.neighborhood.lat,
      longitude: data.neighborhood.lng,
    },
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: cityName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: cityName,
        addressCountry: 'MG',
      },
    },
    url: `${baseUrl}/quartiers/${citySlug}/${quartierSlug}`,
  }

  return (
    <>
      <BreadcrumbJsonLd
        homeLabel={t('common.home')}
        trail={[
          {
            name: t('quartiers.detail.breadcrumb.quartiers'),
            href: '/quartiers',
          },
          { name: cityName, href: `/quartiers/${citySlug}` },
          {
            name: quartierName,
            href: `/quartiers/${citySlug}/${quartierSlug}`,
          },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(placeJsonLd) }}
      />

      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-10">
        {/* Header — breadcrumb + name + stats */}
        <header className="mb-8 flex flex-col gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground"
          >
            <Link href="/" className="transition hover:text-foreground">
              {t('common.appName')}
            </Link>
            <Icon name="arrow-right" size={11} />
            <Link
              href="/quartiers"
              className="transition hover:text-foreground"
            >
              {t('quartiers.detail.breadcrumb.quartiers')}
            </Link>
            <Icon name="arrow-right" size={11} />
            <Link
              href={`/quartiers/${citySlug}`}
              className="transition hover:text-foreground"
            >
              {cityName}
            </Link>
            <Icon name="arrow-right" size={11} />
            <span className="text-foreground">{quartierName}</span>
          </nav>
          <h1 className="font-serif text-[clamp(32px,3.8vw,52px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
            {quartierName}
            <span className="ml-3 align-middle font-sans text-[14px] font-medium tracking-normal text-muted-foreground">
              {cityName}
            </span>
          </h1>
          <p className="max-w-2xl text-[14.5px] text-foreground/70">
            {data.publishedListings === 0
              ? t('quartiers.detail.lead.empty')
              : t(
                  data.publishedListings === 1
                    ? 'quartiers.detail.lead.with.one'
                    : 'quartiers.detail.lead.with.other',
                  {
                    count: String(data.publishedListings),
                    quartier: quartierName,
                  },
                )}
          </p>

          {/* Stats strip */}
          <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3 text-[13px]">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('quartiers.detail.stats.listings')}
              </dt>
              <dd className="mt-0.5 font-mono text-[15px] font-bold text-foreground">
                {data.publishedListings}
              </dd>
            </div>
            {data.avgPriceMGA !== null && (
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t('quartiers.detail.stats.avgPrice')}
                </dt>
                <dd className="mt-0.5 font-mono text-[15px] font-bold text-foreground">
                  {formatAriary(data.avgPriceMGA)}
                </dd>
              </div>
            )}
          </dl>
        </header>

        {/* Two-column: about + mini-map */}
        <section className="mb-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <article>
            <h2 className="mb-4 font-serif text-[24px] font-normal leading-tight tracking-[-0.015em] text-foreground">
              {t('quartiers.detail.about.title', { quartier: quartierName })}
            </h2>
            {descriptor ? (
              <dl className="flex flex-col gap-4 text-[14px] leading-relaxed">
                <div>
                  <dt className="text-[11.5px] font-medium uppercase tracking-wider text-primary">
                    {t('quartiers.detail.about.ambiance')}
                  </dt>
                  <dd className="mt-1 text-foreground/80">
                    {t(descriptor.ambiance)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11.5px] font-medium uppercase tracking-wider text-primary">
                    {t('quartiers.detail.about.walk')}
                  </dt>
                  <dd className="mt-1 text-foreground/80">
                    {t(descriptor.walk)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11.5px] font-medium uppercase tracking-wider text-primary">
                    {t('quartiers.detail.about.transport')}
                  </dt>
                  <dd className="mt-1 text-foreground/80">
                    {t(descriptor.transport)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11.5px] font-medium uppercase tracking-wider text-primary">
                    {t('quartiers.detail.about.distance')}
                  </dt>
                  <dd className="mt-1 text-foreground/80">
                    {t(descriptor.distance)}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-[14px] text-foreground/70">
                {t('quartiers.detail.about.empty')}
              </p>
            )}
          </article>

          <div>
            <QuartierDetailMap
              lat={data.neighborhood.lat}
              lng={data.neighborhood.lng}
              label={t('quartiers.detail.map.aria', {
                quartier: quartierName,
              })}
            />
          </div>
        </section>

        {/* Recent listings */}
        {data.recentListings.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-[24px] font-normal leading-tight tracking-[-0.015em] text-foreground">
                {t('quartiers.detail.listings.title', {
                  quartier: quartierName,
                })}
              </h2>
              {data.publishedListings > data.recentListings.length && (
                <Link
                  href={annoncesHref}
                  className="text-[13px] font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t(
                    data.publishedListings === 1
                      ? 'quartiers.detail.listings.viewAll.one'
                      : 'quartiers.detail.listings.viewAll.other',
                    { count: String(data.publishedListings) },
                  )}{' '}
                  →
                </Link>
              )}
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.recentListings.map((l, i) => (
                <PublicListingCard
                  key={l.id}
                  t={t}
                  // The detail-query shape lacks city/neighborhood
                  // names (already scoped to this quartier). Adapt
                  // to the card's expected shape by re-injecting
                  // them from the page-level data.
                  listing={{
                    id: l.id,
                    slug: l.slug,
                    title: l.title,
                    type: l.type,
                    priceMonthlyMGA: l.priceMonthlyMGA,
                    publishedAt: l.publishedAt,
                    verifiedAt: l.verifiedAt,
                    city: {
                      slug: data.city.slug,
                      nameFr: data.city.nameFr,
                    },
                    neighborhood: {
                      slug: data.neighborhood.slug,
                      nameFr: data.neighborhood.nameFr,
                    },
                    photo: l.photo,
                  }}
                  priority={i === 0}
                />
              ))}
            </ul>
          </section>
        )}

        {/* Sibling quartiers — "other quartiers à <city>" */}
        {data.siblings.length > 0 && (
          <section>
            <h2 className="mb-6 font-serif text-[24px] font-normal leading-tight tracking-[-0.015em] text-foreground">
              {t('quartiers.detail.siblings.title', { city: cityName })}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.siblings.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/quartiers/${citySlug}/${s.slug}`}
                    className="block rounded-lg border border-border bg-background p-4 transition hover:border-primary/40 hover:bg-muted/40"
                  >
                    <p className="font-serif text-[18px] font-normal text-foreground">
                      {locale === 'mg' ? s.nameMg : s.nameFr}
                    </p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {t(
                        s.publishedListings === 1
                          ? 'quartiers.detail.siblings.listingsCount.one'
                          : 'quartiers.detail.siblings.listingsCount.other',
                        { count: String(s.publishedListings) },
                      )}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}
