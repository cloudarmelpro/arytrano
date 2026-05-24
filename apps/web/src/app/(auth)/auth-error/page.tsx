import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT, type Translator } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return {
    title: t('authError.title.default'),
    alternates: await localeAlternates('/auth-error'),
    robots: { index: false, follow: false },
  }
}

/**
 * Catch-all page rendered when Auth.js encounters an OAuth / configuration
 * error. Auth.js passes the error type via the `?error=` query string.
 * Map known codes to translated title + description so the user gets
 * something actionable instead of a generic 404.
 *
 * Auth.js error codes covered: Configuration, AccessDenied, Verification,
 * CredentialsSignin, OAuthAccountNotLinked, Default.
 */
function getMessageFor(t: Translator, code: string | undefined) {
  switch (code) {
    case 'Configuration':
      return { title: t('authError.title.configuration'), description: t('authError.description.configuration') }
    case 'AccessDenied':
      return { title: t('authError.title.accessDenied'), description: t('authError.description.accessDenied') }
    case 'Verification':
      return { title: t('authError.title.verification'), description: t('authError.description.verification') }
    case 'CredentialsSignin':
      return { title: t('authError.title.credentialsSignin'), description: t('authError.description.credentialsSignin') }
    case 'OAuthAccountNotLinked':
      return { title: t('authError.title.oauthAccountNotLinked'), description: t('authError.description.oauthAccountNotLinked') }
    default:
      return { title: t('authError.title.default'), description: t('authError.description.default') }
  }
}

const KNOWN_CODES = new Set([
  'Configuration',
  'AccessDenied',
  'Verification',
  'CredentialsSignin',
  'OAuthAccountNotLinked',
])

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const t = getT(await getLocale())
  const info = getMessageFor(t, error)
  // Only render the code chip for KNOWN Auth.js error codes — never echo
  // arbitrary user-supplied strings into the page (cosmetic hardening).
  const knownCode = error && KNOWN_CODES.has(error) ? error : null

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span
        aria-hidden="true"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>

      <header className="flex flex-col items-center gap-2">
        <h1 className="text-4xl text-primary">{info.title}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{info.description}</p>
      </header>

      {knownCode && (
        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
          {t('authError.code')}&nbsp;: {knownCode}
        </span>
      )}

      <div className="flex flex-col items-stretch gap-2 w-full max-w-xs">
        <Link
          href="/sign-in"
          className="rounded-md bg-primary px-4 py-3 text-center font-medium text-primary-foreground transition hover:opacity-90"
        >
          {t('authError.back.signIn')}
        </Link>
        <Link
          href="/"
          className="rounded-md border border-border px-4 py-3 text-center text-sm font-medium text-foreground transition hover:bg-muted"
        >
          {t('authError.back.home')}
        </Link>
      </div>
    </div>
  )
}
