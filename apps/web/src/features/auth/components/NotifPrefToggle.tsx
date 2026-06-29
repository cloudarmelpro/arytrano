'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
// Direct import (not via the auth barrel) — the barrel re-exports
// `auth`/`signIn`/`signOut` which depend on `next/headers` and would
// poison this Client Component's bundle (memory rule
// feedback_feature_index_client_safe).
import {
  updateNotifPrefsAction,
  type UpdateNotifPrefsActionState,
} from '../actions/update-notif-prefs'

const INITIAL: UpdateNotifPrefsActionState = { ok: false }

/**
 * COM-08 — single per-row toggle. Optimistic: flips immediately, then
 * the Server Action persists. Errors revert + surface a toast.
 */
export function NotifPrefToggle({
  prefKey,
  label,
  description,
  initialEnabled,
}: {
  prefKey:
    | 'contactNotificationsEnabled'
    | 'savedSearchAlertsEnabled'
    | 'listingExpirationAlertsEnabled'
    | 'leaseUpdatesEnabled'
  label: string
  description: string
  initialEnabled: boolean
}) {
  const [state, action] = useActionState(updateNotifPrefsAction, INITIAL)
  const [enabled, setEnabled] = useState(initialEnabled)

  useEffect(() => {
    if (state.message) toast.error(state.message)
  }, [state])

  return (
    <form
      action={action}
      className="flex items-start justify-between gap-4 border-t border-border py-4 first:border-t-0 first:pt-0"
    >
      <input type="hidden" name="key" value={prefKey} />
      <input type="hidden" name="enabled" value={String(enabled)} />
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px] font-medium text-foreground">{label}</span>
        <span className="max-w-md text-[12.5px] text-foreground/65">{description}</span>
      </div>
      <ToggleControl
        checked={enabled}
        onChange={(next) => setEnabled(next)}
      />
    </form>
  )
}

function ToggleControl({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (next: boolean) => void
}) {
  const { pending } = useFormStatus()
  return (
    <label className="flex shrink-0 cursor-pointer items-center gap-2">
      <span className="text-[11px] uppercase tracking-wide text-foreground/55">
        {checked ? 'On' : 'Off'}
      </span>
      <Checkbox
        checked={checked}
        disabled={pending}
        onCheckedChange={(c) => {
          // Submit the form right after flipping local state so the
          // hidden inputs carry the new value.
          onChange(Boolean(c))
          // Defer to next microtask — useFormStatus needs to see the
          // request actually start.
          queueMicrotask(() => {
            const form = (document.activeElement as HTMLElement)?.closest('form')
            form?.requestSubmit()
          })
        }}
      />
    </label>
  )
}
