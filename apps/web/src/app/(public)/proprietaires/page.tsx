import type { Metadata } from 'next'
import { ProprietairesPage } from '@/features/static-pages'
import { PROPRIETAIRES_FAQ_ITEMS } from '@/features/static-pages/proprietaires/faq-items'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'
import { BreadcrumbJsonLd } from '@/lib/seo/breadcrumb'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('proprietaires.meta.title'),
    description: t('proprietaires.meta.description'),
    alternates: await localeAlternates('/proprietaires'),
    openGraph: {
      title: t('proprietaires.meta.title'),
      description: t('proprietaires.meta.description'),
      url: '/proprietaires',
      type: 'website',
    },
  }
}

export default async function ProprietairesRoute() {
  const locale = await getLocale()
  const t = getT(locale)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PROPRIETAIRES_FAQ_ITEMS.map((it) => ({
      '@type': 'Question',
      name: t(it.q),
      acceptedAnswer: { '@type': 'Answer', text: t(it.a) },
    })),
  }
  return (
    <>
      <BreadcrumbJsonLd
        homeLabel={t('common.home')}
        trail={[{ name: t('proprietaires.meta.title'), href: '/proprietaires' }]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      <ProprietairesPage locale={locale} />
    </>
  )
}
