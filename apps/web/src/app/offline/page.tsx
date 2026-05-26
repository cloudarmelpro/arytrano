import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

/**
 * E-T13 PWA — offline fallback page.
 *
 * Served by the service worker (`public/sw.js`) when both the network
 * AND the runtime cache fail to deliver a requested navigation. The
 * page itself is in the SW install-time shell cache so it's always
 * available from the second visit onwards, even with zero connectivity.
 *
 * Kept intentionally minimal: a single message + a "Réessayer" CTA that
 * triggers `location.reload()`. No client-side fetch from this page —
 * if the user is offline, any inline data fetch would also fail and
 * make the fallback look broken.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return {
    title: t('offline.title'),
    robots: { index: false, follow: false },
  }
}

export default async function OfflinePage() {
  const t = getT(await getLocale())
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[640px] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-border bg-muted/30 text-foreground/60">
        <svg
          aria-hidden
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-[clamp(28px,3.4vw,40px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
          {t('offline.title')}
        </h1>
        <p className="max-w-md text-[15px] leading-[1.6] text-foreground/65">
          {t('offline.lead')}
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-[13.5px] font-semibold text-primary-foreground transition hover:opacity-95"
        >
          {t('offline.cta.home')}
        </Link>
        {/* Native form so it works without JS — refresh the page. */}
        <form method="get" action="">
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-lg border border-border bg-background px-5 text-[13.5px] font-semibold text-foreground transition hover:bg-muted"
          >
            {t('offline.cta.retry')}
          </button>
        </form>
      </div>
      <p className="text-[12.5px] text-foreground/50">{t('offline.footer')}</p>
    </main>
  )
}
