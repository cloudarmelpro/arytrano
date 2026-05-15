'use client'

import { useState } from 'react'
import { OAuthButtonsRow } from './OAuthButtonsRow'
import { SignUpForm } from './SignUpForm'
import { Separator } from '@/components/ui/separator'
import { useT } from '@/lib/i18n/client'

type SignUpRole = 'STUDENT' | 'OWNER'

/**
 * Wraps the sign-up screen so the role selector can drive BOTH the
 * credentials form AND the OAuth round-trip. Without this, Google OAuth
 * users always landed as STUDENT (Prisma schema default) regardless of
 * what they clicked on the segmented control.
 *
 * Also tracks pending state across the form + OAuth buttons so a click
 * locks all siblings (no double-submit, no role change mid-flight).
 */
export function SignUpClient({
  googleEnabled,
  facebookEnabled,
}: {
  googleEnabled: boolean
  facebookEnabled: boolean
}) {
  const t = useT()
  const [role, setRole] = useState<SignUpRole>('STUDENT')
  const [formPending, setFormPending] = useState(false)
  const [oauthPending, setOauthPending] = useState(false)
  const busy = formPending || oauthPending
  const hasOAuth = googleEnabled || facebookEnabled

  return (
    <div className="flex flex-col gap-6">
      <div
        role="radiogroup"
        aria-label={t('signUp.roleSelector.ariaLabel')}
        className="mx-auto inline-flex items-center rounded-md bg-muted p-1 text-sm font-medium"
      >
        {(['STUDENT', 'OWNER'] as const).map((r) => {
          const active = role === r
          const label = r === 'STUDENT' ? t('signUp.role.STUDENT') : t('signUp.role.OWNER')
          return (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={busy}
              onClick={() => setRole(r)}
              className={`rounded-md px-5 py-1.5 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {hasOAuth && (
        <>
          <OAuthButtonsRow
            googleEnabled={googleEnabled}
            facebookEnabled={facebookEnabled}
            intendedRole={role}
            disabled={formPending}
            onPendingChange={setOauthPending}
          />
          <div className="relative flex items-center">
            <Separator className="flex-1" />
            <span className="mx-3 whitespace-nowrap text-xs text-muted-foreground">
              {t('signUp.separator')}
            </span>
            <Separator className="flex-1" />
          </div>
        </>
      )}

      <SignUpForm role={role} onPendingChange={setFormPending} />
    </div>
  )
}
