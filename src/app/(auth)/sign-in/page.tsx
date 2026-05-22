import type { Metadata } from 'next'
import { SignInClient } from '@/features/auth'
import { AuthPageShell, AuthAltLink } from '@/components/shared/AuthPageShell'
import { env } from '@/lib/env'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return {
    title: t('signIn.title'),
    alternates: await localeAlternates('/sign-in'),
  }
}

export default async function SignInPage() {
  const t = getT(await getLocale())
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
  const facebookEnabled = Boolean(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET)

  return (
    <AuthPageShell
      variant="signin"
      footer={
        <AuthAltLink
          prompt={t('auth.alt.signup')}
          linkLabel={t('auth.alt.signupLink')}
          href="/sign-up"
        />
      }
    >
      <SignInClient googleEnabled={googleEnabled} facebookEnabled={facebookEnabled} />
    </AuthPageShell>
  )
}
