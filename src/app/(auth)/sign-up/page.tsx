import type { Metadata } from 'next'
import Link from 'next/link'
import { SignUpClient } from '@/features/auth/components/SignUpClient'
import { env } from '@/lib/env'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('signUp.title') }
}

export default async function SignUpPage() {
  const t = getT(await getLocale())
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
  const facebookEnabled = Boolean(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET)

  return (
    <div className="flex flex-col items-stretch gap-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl text-primary">{t('signUp.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('signUp.haveAccount')}{' '}
          <Link href="/sign-in" className="font-medium text-primary underline">
            {t('signUp.signInLink')}
          </Link>
        </p>
      </header>

      <SignUpClient googleEnabled={googleEnabled} facebookEnabled={facebookEnabled} />
    </div>
  )
}
