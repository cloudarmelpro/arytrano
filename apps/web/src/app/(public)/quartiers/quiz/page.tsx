import type { Metadata } from 'next'
import { QuizWizard } from '@/features/quiz'
import { getQuartiersData } from '@/features/landing/server'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'
import { BreadcrumbJsonLd } from '@/lib/seo/breadcrumb'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('quiz.meta.title'),
    description: t('quiz.meta.description'),
    alternates: await localeAlternates('/quartiers/quiz'),
    openGraph: {
      title: t('quiz.meta.title'),
      description: t('quiz.meta.description'),
      url: '/quartiers/quiz',
      type: 'website',
    },
  }
}

export default async function QuizPage() {
  const [locale, data] = await Promise.all([getLocale(), getQuartiersData()])
  const t = getT(locale)

  return (
    <>
      <BreadcrumbJsonLd
        homeLabel={t('common.home')}
        trail={[
          { name: t('quartiers.meta.title'), href: '/quartiers' },
          { name: t('quiz.meta.title'), href: '/quartiers/quiz' },
        ]}
      />
      <section className="bg-background pt-16 pb-24 lg:pt-20">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <QuizWizard locale={locale} quartiers={data.quartiers} />
        </div>
      </section>
    </>
  )
}
