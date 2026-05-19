'use client'

import { useState } from 'react'
import { OAuthButtonsRow } from './OAuthButtonsRow'
import { SignUpForm } from './SignUpForm'
import { Separator } from '@/components/ui/separator'
import { useT } from '@/lib/i18n/client'
import { Icon, type IconName } from '@/components/shared/Icon'

type SignUpRole = 'STUDENT' | 'OWNER'

const ROLES: Array<{
  value: SignUpRole
  icon: IconName
  nameKey: 'signUp.role.STUDENT' | 'signUp.role.OWNER'
  subKey: 'auth.role.student.sub' | 'auth.role.owner.sub'
}> = [
  {
    value: 'STUDENT',
    icon: 'user',
    nameKey: 'signUp.role.STUDENT',
    subKey: 'auth.role.student.sub',
  },
  {
    value: 'OWNER',
    icon: 'building',
    nameKey: 'signUp.role.OWNER',
    subKey: 'auth.role.owner.sub',
  },
]

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
        className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1"
      >
        {ROLES.map((r) => {
          const active = role === r.value
          return (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={busy}
              onClick={() => setRole(r.value)}
              data-active={active}
              className={`group grid grid-cols-[40px_1fr_18px] items-center gap-3.5 rounded-xl p-4 pl-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? 'bg-primary/5 text-foreground outline-2 outline-primary'
                  : 'bg-muted/60 text-foreground/70 hover:bg-muted hover:text-foreground'
              }`}
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] transition ${
                  active ? 'bg-primary text-white' : 'bg-background text-foreground/70'
                }`}
              >
                <Icon name={r.icon} size={18} />
              </span>
              <span className="flex flex-col">
                <span className="text-[14.5px] font-semibold leading-[1.2] tracking-[-0.005em] text-foreground">
                  {t(r.nameKey)}
                </span>
                <span className="mt-0.5 text-[12.5px] font-medium leading-[1.3] text-muted-foreground">
                  {t(r.subKey)}
                </span>
              </span>
              <span
                aria-hidden
                className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] transition ${
                  active
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-transparent text-transparent'
                }`}
              >
                <Icon name="check" size={10} stroke={3} />
              </span>
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
