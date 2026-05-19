import type { Metadata } from 'next'
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('quartiers.meta.title'),
    description: t('quartiers.meta.description'),
    alternates: await localeAlternates('/quartiers'),
    openGraph: {
      title: t('quartiers.meta.title'),
      description: t('quartiers.meta.description'),
      url: '/quartiers',
      type: 'website',
    },
  }
}

export default async function QuartiersPage() {
  const [locale, data] = await Promise.all([getLocale(), getQuartiersData()])
  return (
    <>
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
