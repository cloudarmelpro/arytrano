'use client'

import { useState } from 'react'
import { OAuthButtonsRow } from './OAuthButtonsRow'
import { SignInForm } from './SignInForm'
import { Separator } from '@/components/ui/separator'
import { useT } from '@/lib/i18n/client'

/**
 * Wraps the sign-in screen so OAuth buttons and the credentials form can
 * mutually lock each other while one is submitting. Prevents the user from
 * starting a second auth flow on top of an in-flight one.
 */
export function SignInClient({
  googleEnabled,
  facebookEnabled,
}: {
  googleEnabled: boolean
  facebookEnabled: boolean
}) {
  const t = useT()
  const [formPending, setFormPending] = useState(false)
  const [oauthPending, setOauthPending] = useState(false)
  const hasOAuth = googleEnabled || facebookEnabled

  return (
    <div className="flex flex-col gap-6">
      {hasOAuth && (
        <>
          <OAuthButtonsRow
            googleEnabled={googleEnabled}
            facebookEnabled={facebookEnabled}
            disabled={formPending}
            onPendingChange={setOauthPending}
          />
          <div className="relative flex items-center">
            <Separator className="flex-1" />
            <span className="mx-3 whitespace-nowrap text-xs text-muted-foreground">
              {t('signIn.separator')}
            </span>
            <Separator className="flex-1" />
          </div>
        </>
      )}

      <SignInForm onPendingChange={setFormPending} />
      {oauthPending && <span className="sr-only">{t('oauthProvider.redirecting')}</span>}
    </div>
  )
}
