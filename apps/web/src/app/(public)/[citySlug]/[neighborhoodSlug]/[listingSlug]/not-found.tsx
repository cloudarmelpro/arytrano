import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export const metadata: Metadata = {
  title: 'Annonce introuvable',
  robots: { index: false, follow: false },
}

/**
 * Scoped 404 for listing detail URLs. Fires when :
 *   - The listingSlug doesn't exist (typo, never created)
 *   - The listing exists but its status is DRAFT, SUSPENDED, or
 *     DELETED (the public page calls notFound() in those cases —
 *     UNAVAILABLE redirects to /annonces instead, see page.tsx).
 *
 * Stays inside the public layout so the header + footer remain
 * visible, giving the visitor an easy way to keep browsing.
 *
 * Common path : visitor clicks an old bookmark / shared link to a
 * listing the owner has since taken down. We want them to feel
 * "the marketplace is alive, just this one is gone" rather than
 * "the site is broken".
 */
export default async function ListingNotFound() {
  const t = getT(await getLocale())
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[720px] flex-col items-center justify-center px-6 py-20 text-center">
      <span
        aria-hidden
        className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </span>
      <h1 className="mt-5 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
        {t('listing.notFound.title')}
      </h1>
      <p className="mt-3 max-w-[520px] text-[15px] leading-[1.6] text-foreground/70">
        {t('listing.notFound.lead')}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/annonces"
          className="inline-flex h-12 items-center rounded-xl bg-primary px-5 text-[14.5px] text-primary-foreground transition hover:opacity-95"
        >
          {t('listing.notFound.cta.search')}
        </Link>
        <Link
          href="/quartiers"
          className="inline-flex h-12 items-center rounded-xl bg-muted/60 px-5 text-[14.5px] text-foreground transition hover:bg-muted"
        >
          {t('listing.notFound.cta.quartiers')}
        </Link>
      </div>
    </main>
  )
}
