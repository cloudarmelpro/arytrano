'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/client'

/**
 * Shows a one-time success toast when the user lands on /sign-in
 * after consuming a verification link (`?verified=1`).
 *
 * Effect runs once on mount — Sonner's `id` dedups so a strict-mode
 * double-mount doesn't fire two toasts.
 */
export function VerifiedSuccessToast() {
  const t = useT()
  const params = useSearchParams()
  const verified = params.get('verified') === '1'

  useEffect(() => {
    if (verified) {
      toast.success(t('signIn.verifiedToast'), {
        id: 'email-verified',
        duration: 6000,
      })
    }
  }, [verified, t])

  return null
}
