import type { Metadata } from 'next'
import Link from 'next/link'
import { SignInClient } from '@/features/auth/components/SignInClient'
import { env } from '@/lib/env'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('signIn.title') }
}

export default async function SignInPage() {
  const t = getT(await getLocale())
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
  const facebookEnabled = Boolean(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET)

  return (
    <div className="flex flex-col items-stretch gap-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl text-primary">{t('signIn.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('signIn.noAccount')}{' '}
          <Link href="/sign-up" className="font-medium text-primary underline">
            {t('signIn.signUpLink')}
          </Link>
        </p>
      </header>

      <SignInClient googleEnabled={googleEnabled} facebookEnabled={facebookEnabled} />
    </div>
  )
}
