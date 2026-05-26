'use client'

import { useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { signInWithProvider } from '../actions/oauth-sign-in'
import type { OAuthProvider } from '../schemas'
import { OAUTH_ICONS } from './oauth-icons'

function SubmitButton({
  provider,
  disabled,
  onPendingChange,
}: {
  provider: OAuthProvider
  disabled: boolean
  onPendingChange?: (pending: boolean) => void
}) {
  const t = useT()
  const { pending } = useFormStatus()

  useEffect(() => {
    onPendingChange?.(pending)
  }, [pending, onPendingChange])

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" aria-hidden />
          {t('oauthProvider.redirecting')}
        </>
      ) : (
        <>
          {OAUTH_ICONS[provider]}
          {t(`oauthProvider.${provider}` as const)}
        </>
      )}
    </button>
  )
}

export function OAuthButton({
  provider,
  intendedRole,
  disabled = false,
  onPendingChange,
}: {
  provider: OAuthProvider
  /** Role chosen on the sign-up page. Bridged to OAuth callback via cookie. */
  intendedRole?: 'STUDENT' | 'OWNER'
  /** External lock (e.g. another form is pending in the parent). */
  disabled?: boolean
  /** Reports own pending state up so the parent can lock siblings. */
  onPendingChange?: (pending: boolean) => void
}) {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? undefined

  async function action() {
    await signInWithProvider(provider, intendedRole, returnTo)
  }
  return (
    <form action={action} className="w-full">
      <SubmitButton
        provider={provider}
        disabled={disabled}
        onPendingChange={onPendingChange}
      />
    </form>
  )
}
