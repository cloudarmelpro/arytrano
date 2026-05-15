'use client'

import { OAuthButton } from './OAuthButton'

/**
 * Renders enabled OAuth providers. Pure client — the env-driven flags are
 * computed by the server parent and passed in, so this component can also
 * receive `intendedRole` from client state (sign-up page role selector).
 */
export function OAuthButtonsRow({
  googleEnabled,
  facebookEnabled,
  intendedRole,
  disabled,
  onPendingChange,
}: {
  googleEnabled: boolean
  facebookEnabled: boolean
  /** Role to attach to the OAuth round-trip (sign-up only). */
  intendedRole?: 'STUDENT' | 'OWNER'
  /** External lock — e.g. the credentials form is submitting. */
  disabled?: boolean
  /** Reports up when ANY provider's form is pending. */
  onPendingChange?: (pending: boolean) => void
}) {
  if (!googleEnabled && !facebookEnabled) return null

  return (
    <div className="flex flex-col gap-2.5">
      {googleEnabled && (
        <OAuthButton
          provider="google"
          intendedRole={intendedRole}
          disabled={disabled}
          onPendingChange={onPendingChange}
        />
      )}
      {facebookEnabled && (
        <OAuthButton
          provider="facebook"
          intendedRole={intendedRole}
          disabled={disabled}
          onPendingChange={onPendingChange}
        />
      )}
    </div>
  )
}
