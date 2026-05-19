import type { Metadata } from 'next'
import { ProprietairesPage } from '@/features/static-pages/proprietaires/ProprietairesPage'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'

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
  return <ProprietairesPage locale={locale} />
}
