import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
}

/**
 * Global 404 page. Reached when Next can't match a route OR when any
 * `notFound()` call below an RSC fires without a more specific
 * `not-found.tsx` in the route tree.
 *
 * Lean content : no header / footer here — Next renders this WITHOUT
 * the surrounding layout context that may have crashed during the
 * lookup. The home + listings CTAs cover both anon visitors (looking
 * for a place) and signed-in owners (checking their dashboard).
 */
export default async function NotFound() {
  const t = getT(await getLocale())
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col items-center justify-center px-6 py-20 text-center">
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
        404
      </span>
      <h1 className="mt-3 text-[clamp(28px,3.6vw,40px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
        {t('notFound.title')}
      </h1>
      <p className="mt-3 max-w-[480px] text-[15px] leading-[1.55] text-foreground/70">
        {t('notFound.lead')}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-xl bg-primary px-5 text-[14.5px] font-semibold text-primary-foreground transition hover:opacity-95"
        >
          {t('notFound.cta.home')}
        </Link>
        <Link
          href="/annonces"
          className="inline-flex h-12 items-center rounded-xl bg-muted/60 px-5 text-[14.5px] font-semibold text-foreground transition hover:bg-muted"
        >
          {t('notFound.cta.listings')}
        </Link>
      </div>
    </main>
  )
}
