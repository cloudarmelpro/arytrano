'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/client'
import type { MessageKey } from '@/lib/i18n/messages'

const REASON_TO_KEY: Record<string, MessageKey> = {
  'admin-revoked': 'dashboard.reason.adminRevoked',
}

/**
 * Mirrors `SignInReasonToast` but for /dashboard. Fired when the admin
 * layout bounces a former admin (role demoted while signed in).
 */
export function DashboardReasonToast() {
  const t = useT()
  const params = useSearchParams()
  const reason = params.get('reason')

  useEffect(() => {
    if (!reason) return
    const key = REASON_TO_KEY[reason]
    if (!key) return
    toast.info(t(key), { id: `dashboard-reason:${reason}`, duration: 7000 })
  }, [reason, t])

  return null
}
