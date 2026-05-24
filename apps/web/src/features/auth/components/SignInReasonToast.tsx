'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/client'
import type { MessageKey } from '@/lib/i18n/messages'

/**
 * Shows a contextual toast on /sign-in when the URL carries `?reason=`.
 * Used to explain WHY the user landed back on sign-in — distinguishes
 * a stale-session bounce ("your session expired") from a plain
 * "please log in" so users don't think the app is broken.
 *
 * Stays in sync with the `redirect('/sign-in?reason=...')` calls in
 * the dashboard + admin layout guards.
 */
const REASON_TO_KEY: Record<string, { key: MessageKey; level: 'info' | 'error' }> = {
  'session-expired': {
    key: 'signIn.reason.sessionExpired',
    level: 'info',
  },
  'account-suspended': {
    key: 'signIn.reason.accountSuspended',
    level: 'error',
  },
}

export function SignInReasonToast() {
  const t = useT()
  const params = useSearchParams()
  const reason = params.get('reason')

  useEffect(() => {
    if (!reason) return
    const entry = REASON_TO_KEY[reason]
    if (!entry) return
    const message = t(entry.key)
    if (entry.level === 'error') {
      toast.error(message, { id: `reason:${reason}`, duration: 6000 })
    } else {
      toast.info(message, { id: `reason:${reason}`, duration: 6000 })
    }
  }, [reason, t])

  return null
}
