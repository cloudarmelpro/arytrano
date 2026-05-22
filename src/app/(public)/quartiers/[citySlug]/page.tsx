import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import {
  QuartiersHero,
  QuartiersMap,
  QuartiersJump,
  QuartiersBlocks,
  QuartiersQuizCta,
} from '@/features/landing'
import { getQuartiersData } from '@/features/landing/server'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'
import { BreadcrumbJsonLd } from '@/lib/seo/breadcrumb'

type Params = Promise<{ citySlug: string }>

async function getCityOrNotFound(citySlug: string) {
  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
    select: { slug: true, nameFr: true, nameMg: true, lat: true, lng: true },
  })
  if (!city) notFound()
  return city
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { citySlug } = await params
  const city = await getCityOrNotFound(citySlug)
  const t = getT(await getLocale())
  // Re-uses the global quartiers.meta.* keys but threads the city
  // name in. The {city} placeholder lives inside the i18n strings.
  const title = t('quartiers.cityMeta.title', { city: city.nameFr })
  const description = t('quartiers.cityMeta.description', {
    city: city.nameFr,
  })
  return {
    title,
    description,
    alternates: await localeAlternates(`/quartiers/${city.slug}`),
    openGraph: {
      title,
      description,
      url: `/quartiers/${city.slug}`,
      type: 'website',
    },
  }
}

export default async function QuartiersByCityPage({
  params,
}: {
  params: Params
}) {
  const { citySlug } = await params
  const city = await getCityOrNotFound(citySlug)
  const [locale, data] = await Promise.all([
    getLocale(),
    getQuartiersData(city.slug),
  ])
  const t = getT(locale)

  return (
    <>
      <BreadcrumbJsonLd
        homeLabel={t('common.home')}
        trail={[
          { name: t('quartiers.meta.title'), href: '/quartiers' },
          { name: city.nameFr, href: `/quartiers/${city.slug}` },
        ]}
      />
      <QuartiersHero
        locale={locale}
        quartiersCount={data.quartiers.length}
        totalListings={data.totalListings}
      />
      <QuartiersMap locale={locale} quartiers={data.quartiers} />
      <QuartiersJump locale={locale} quartiers={data.quartiers} />
      <QuartiersBlocks locale={locale} quartiers={data.quartiers} />
      <QuartiersQuizCta locale={locale} />
    </>
  )
}
