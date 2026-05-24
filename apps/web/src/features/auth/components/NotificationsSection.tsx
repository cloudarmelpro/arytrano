'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/client'
import { toggleContactNotificationsAction } from '../actions/toggle-contact-notifications'

type Props = {
  /** Initial server-rendered state of the toggle. */
  initialEnabled: boolean
}

/**
 * Owner-only opt-in/out for the "contact received" email (T-047).
 * Lives in /dashboard/settings. Optimistic UI : we flip the state
 * client-side immediately and roll back if the action fails — feels
 * snappier than waiting for the round-trip.
 */
export function NotificationsSection({ initialEnabled }: Props) {
  const t = useT()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [pending, startTransition] = useTransition()

  function handleToggle(next: boolean) {
    const previous = enabled
    setEnabled(next)
    startTransition(async () => {
      const res = await toggleContactNotificationsAction(next)
      if (!res.ok) {
        setEnabled(previous)
        toast.error(res.message ?? t('settings.notifications.error'))
      } else {
        toast.success(
          next
            ? t('settings.notifications.toast.on')
            : t('settings.notifications.toast.off'),
        )
      }
    })
  }

  return (
    <div className="flex items-start justify-between gap-6 rounded-2xl bg-muted/40 p-5">
      <div className="flex-1">
        <p className="text-[15px] font-semibold text-foreground">
          {t('settings.notifications.contactReceived.label')}
        </p>
        <p className="mt-1 text-[13.5px] leading-[1.55] text-foreground/70">
          {t('settings.notifications.contactReceived.help')}
        </p>
      </div>
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => handleToggle(e.target.checked)}
          disabled={pending}
          aria-label={t('settings.notifications.contactReceived.label')}
          className="peer sr-only"
        />
        <span className="h-7 w-12 rounded-full bg-muted-foreground/30 transition peer-checked:bg-primary peer-disabled:opacity-60" />
        <span className="absolute left-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5 peer-disabled:opacity-80" />
      </label>
    </div>
  )
}
