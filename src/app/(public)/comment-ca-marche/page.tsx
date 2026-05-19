import type { Metadata } from 'next'
import {
  CommentClient,
  CommentWhy,
  CommentVerif,
  CommentDont,
  CommentMoney,
} from '@/features/static-pages'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'

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
  return (
    <>
      <CommentClient />
      <CommentWhy locale={locale} />
      <CommentVerif locale={locale} />
      <CommentDont locale={locale} />
      <CommentMoney locale={locale} />
    </>
  )
}
