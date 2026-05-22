import type { Metadata } from 'next'
import Link from 'next/link'
import { unsubscribeByToken } from '@/features/alerts/services/unsubscribe-by-token'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

/**
 * Public unsubscribe landing (T-045). One-click endpoint reached from
 * the unsubscribe footer of every outbound WhatsApp/email broadcast.
 *
 * No auth — the token IS the proof of authority. Anyone holding the
 * link can opt out. Idempotent: re-clicking after success shows the
 * "already unsubscribed" message rather than pretending it just worked.
 *
 * Returns 200 in all branches (even invalid token) to avoid leaking
 * whether a token exists — same reason we don't 404 on auth-related
 * lookups elsewhere in the app.
 */
export const metadata: Metadata = {
  title: 'AryTrano — Désabonnement',
  robots: { index: false, follow: false },
}

type Params = Promise<{ token: string }>

export default async function UnsubscribePage({
  params,
}: {
  params: Params
}) {
  const [{ token }, locale] = await Promise.all([params, getLocale()])
  const t = getT(locale)
  const result = await unsubscribeByToken(token)

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[560px] flex-col items-center justify-center px-6 py-20 text-center">
      {result.ok ? (
        <>
          <span
            aria-hidden
            className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <h1 className="mt-5 font-serif text-[clamp(26px,3vw,36px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
            {result.alreadyUnsubscribed
              ? t('unsubscribe.alreadyDone.title')
              : t('unsubscribe.success.title')}
          </h1>
          <p className="mt-3 max-w-[440px] text-[15px] leading-[1.6] text-foreground/70">
            {result.alreadyUnsubscribed
              ? t('unsubscribe.alreadyDone.body')
              : t('unsubscribe.success.body')}
          </p>
        </>
      ) : (
        <>
          <span
            aria-hidden
            className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
          <h1 className="mt-5 font-serif text-[clamp(26px,3vw,36px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
            {t('unsubscribe.invalid.title')}
          </h1>
          <p className="mt-3 max-w-[440px] text-[15px] leading-[1.6] text-foreground/70">
            {t('unsubscribe.invalid.body')}
          </p>
        </>
      )}

      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-xl bg-muted/60 px-5 text-[14px] font-semibold text-foreground transition hover:bg-muted"
      >
        {t('unsubscribe.backHome')}
      </Link>
    </main>
  )
}
