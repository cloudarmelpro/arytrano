import type { Metadata } from 'next'
import { SignUpClient } from '@/features/auth'
import { AuthPageShell, AuthAltLink } from '@/components/shared/AuthPageShell'
import { env } from '@/lib/env'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return {
    title: t('signUp.title'),
    alternates: await localeAlternates('/sign-up'),
  }
}

type SearchParams = Promise<{ role?: string }>

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [locale, sp] = await Promise.all([getLocale(), searchParams])
  const t = getT(locale)
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
  const facebookEnabled = Boolean(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET)
  const initialRole = sp.role === 'OWNER' ? 'OWNER' : 'STUDENT'

  return (
    <AuthPageShell
      variant="signup"
      footer={
        <AuthAltLink
          prompt={t('auth.alt.signin')}
          linkLabel={t('auth.alt.signinLink')}
          href="/sign-in"
        />
      }
    >
      <SignUpClient
        googleEnabled={googleEnabled}
        facebookEnabled={facebookEnabled}
        initialRole={initialRole}
      />
    </AuthPageShell>
  )
}
