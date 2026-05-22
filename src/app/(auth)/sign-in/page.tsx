import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import {
  auth,
  SignInClient,
  SignInReasonToast,
  VerifiedSuccessToast,
} from '@/features/auth'
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
  // Signed-in users have nothing to do on /sign-in. Bouncing them to
  // /dashboard avoids the confusing "I'm already logged in but the
  // page is asking me to log in" state.
  const session = await auth()
  if (session?.user) redirect('/dashboard')

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
      {/* Both toasts read URL search params via useSearchParams() which
          requires a Suspense boundary in Next 16. The same Suspense
          shell is reused — only one of the two toasts fires per page
          load (verified=1 from email verification, reason=... from a
          stale-session bounce). */}
      <Suspense fallback={null}>
        <VerifiedSuccessToast />
        <SignInReasonToast />
      </Suspense>
    </AuthPageShell>
  )
}
