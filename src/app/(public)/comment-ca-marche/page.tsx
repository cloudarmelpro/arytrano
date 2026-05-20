import type { Metadata } from 'next'
import {
  CommentClient,
  CommentHero,
  CommentWhy,
  CommentVerif,
  CommentDont,
  CommentFinalCta,
} from '@/features/static-pages'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'
import { BreadcrumbJsonLd } from '@/lib/seo/breadcrumb'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('comment.meta.title'),
    description: t('comment.meta.description'),
    alternates: await localeAlternates('/comment-ca-marche'),
    openGraph: {
      title: t('comment.meta.title'),
      description: t('comment.meta.description'),
      url: '/comment-ca-marche',
      type: 'website',
    },
  }
}

export default async function CommentCaMarchePage() {
  const locale = await getLocale()
  const t = getT(locale)
  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t('comment.meta.title'),
    description: t('comment.meta.description'),
    step: [
      { title: t('comment.studentFlow.s1.title'), desc: t('comment.studentFlow.s1.desc') },
      { title: t('comment.studentFlow.s2.title'), desc: t('comment.studentFlow.s2.desc') },
      { title: t('comment.studentFlow.s3.title'), desc: t('comment.studentFlow.s3.desc') },
      { title: t('comment.studentFlow.s4.title'), desc: t('comment.studentFlow.s4.desc') },
      { title: t('comment.studentFlow.s5.title'), desc: t('comment.studentFlow.s5.desc') },
    ].map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.desc,
    })),
  }
  return (
    <>
      <BreadcrumbJsonLd
        homeLabel={t('common.home')}
        trail={[{ name: t('comment.meta.title'), href: '/comment-ca-marche' }]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(howToJsonLd) }}
      />
      <CommentHero locale={locale} />
      <CommentClient />
      <CommentWhy locale={locale} />
      <CommentVerif locale={locale} />
      <CommentDont locale={locale} />
      <CommentFinalCta locale={locale} />
    </>
  )
}
