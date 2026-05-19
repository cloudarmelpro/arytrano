import type { Metadata } from 'next'
import { auth } from '@/features/auth'
import { listCitiesWithNeighborhoods } from '@/features/geo'
import {
  LandingHero,
  LandingTrustStrip,
  LandingHowItWorks,
  LandingNeighborhoods,
  LandingFeatured,
  LandingStudents,
  LandingOwnerBlock,
  LandingFaq,
  LandingFinalCta,
  type NeighborhoodOption,
} from '@/features/landing'
import {
  getLandingStats,
  listNeighborhoodsWithCounts,
} from '@/features/landing/server'
import { listPublicListings } from '@/features/listings/server'
import { getFavoritedListingIds } from '@/features/favorites/server'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('landing.meta.title'),
    description: t('landing.meta.description'),
    alternates: await localeAlternates('/'),
    openGraph: {
      title: t('landing.meta.title'),
      description: t('landing.meta.description'),
      url: '/',
      type: 'website',
    },
  }
}

const FEATURED_LIMIT = 6

export default async function HomePage() {
  const [session, locale, cities, stats, neighborhoodsRows, featured] =
    await Promise.all([
      auth(),
      getLocale(),
      listCitiesWithNeighborhoods(),
      getLandingStats(),
      listNeighborhoodsWithCounts(),
      // Tap the existing public-list query — defaults to newest-first +
      // PUBLISHED-only + watermark-aware. We just cap at 6 for the
      // landing's "Featured" rail; pagination is irrelevant here.
      listPublicListings({}),
    ])

  const featuredItems = featured.items.slice(0, FEATURED_LIMIT)
  const favoritedIds = await getFavoritedListingIds(
    session?.user?.id ?? null,
    featuredItems.map((l) => l.id),
  )

  // v0.5 — only Fianarantsoa is seeded. Flatten its neighborhoods for the
  // hero search card. When multi-city ships, swap this for a city tab UI
  // or a city select in the search card itself.
  const neighborhoods: NeighborhoodOption[] = (cities[0]?.neighborhoods ?? []).map(
    (n) => ({
      slug: n.slug,
      label: locale === 'mg' ? n.nameMg : n.nameFr,
    }),
  )

  return (
    <>
      <LandingHero
        locale={locale}
        neighborhoods={neighborhoods}
        publishedListings={stats.publishedListings}
        verifiedOwners={stats.verifiedOwners}
      />
      <LandingTrustStrip locale={locale} />
      <div id="neighborhoods">
        <LandingNeighborhoods locale={locale} rows={neighborhoodsRows} />
      </div>
      <LandingFeatured
        listings={featuredItems}
        totalPublished={stats.publishedListings}
        authenticated={Boolean(session?.user)}
        favoritedIds={favoritedIds}
      />
      <div id="how-it-works">
        <LandingHowItWorks locale={locale} />
      </div>
      <LandingStudents locale={locale} />
      <div id="owner">
        <LandingOwnerBlock locale={locale} role={session?.user?.role ?? null} />
      </div>
      <div id="faq">
        <LandingFaq locale={locale} />
      </div>
      <LandingFinalCta locale={locale} />
    </>
  )
}
