import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('verifyEmail.title') }
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams
  const t = getT(await getLocale())

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span
        aria-hidden="true"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary text-2xl font-semibold"
      >
        @
      </span>

      <header className="flex flex-col items-center gap-2">
        <h1 className="text-4xl text-primary">{t('verifyEmail.title')}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{t('verifyEmail.lead')}</p>
      </header>

      {email && (
        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          {email}
        </span>
      )}

      <Link
        href="/sign-in"
        className="w-full max-w-xs rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:opacity-90"
      >
        {t('verifyEmail.signInLink')}
      </Link>

      <Link href="/sign-up" className="text-sm text-muted-foreground underline">
        {t('verifyEmail.changeEmail')}
      </Link>
    </div>
  )
}
