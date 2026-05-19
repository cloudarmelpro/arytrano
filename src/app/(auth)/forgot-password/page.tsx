import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/features/auth'
import { AuthPageShell, AuthAltLink } from '@/components/shared/AuthPageShell'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('forgot.title') }
}

export default async function ForgotPasswordPage() {
  const t = getT(await getLocale())
  return (
    <AuthPageShell
      variant="forgot"
      footer={
        <AuthAltLink
          prompt={t('auth.alt.signin')}
          linkLabel={t('auth.alt.signinLink')}
          href="/sign-in"
        />
      }
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  )
}
