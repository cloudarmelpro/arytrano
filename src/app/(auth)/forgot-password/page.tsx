import type { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('forgot.title') }
}

export default async function ForgotPasswordPage() {
  const t = getT(await getLocale())
  return (
    <div className="flex flex-col items-stretch gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </span>
        <h1 className="text-4xl text-primary">{t('forgot.title')}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t('forgot.lead')}</p>
      </header>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/sign-in" className="font-medium text-primary underline">
          {t('forgot.backToSignIn')}
        </Link>
      </p>
    </div>
  )
}
