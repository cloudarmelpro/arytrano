import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/features/auth'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('home.metaTitle'),
    description: t('home.metaDescription'),
    alternates: await localeAlternates('/'),
    openGraph: {
      title: `${t('common.appName')} — ${t('home.metaTitle')}`,
      description: t('home.metaDescription'),
      url: '/',
      type: 'website',
    },
  }
}

export default async function HomePage() {
  const [session, locale] = await Promise.all([auth(), getLocale()])
  const t = getT(locale)
  return (
    <div>
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:py-28">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary-foreground">
          {t('home.eyebrow')}
        </span>
        <h1 className="max-w-3xl text-4xl leading-tight text-primary sm:text-5xl">
          {t('home.heroTitle')}
        </h1>
        <p className="max-w-2xl text-lg text-foreground/80">{t('home.heroLead')}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
            >
              {t('home.cta.dashboard')}
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
              >
                {t('home.cta.signUp')}
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 font-medium text-foreground hover:bg-muted"
              >
                {t('home.cta.signIn')}
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
          {[
            {
              title: t('home.feature.verified.title'),
              body: t('home.feature.verified.body'),
            },
            {
              title: t('home.feature.price.title'),
              body: t('home.feature.price.body'),
            },
            {
              title: t('home.feature.contact.title'),
              body: t('home.feature.contact.body'),
            },
          ].map((f) => (
            <article key={f.title} className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-primary">{f.title}</h2>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
