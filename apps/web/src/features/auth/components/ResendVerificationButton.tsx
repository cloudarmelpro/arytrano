'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import { resendVerificationEmailAction } from '../actions/resend-verification-email'

/**
 * Resend-verification-email button shown on `/verify-email`. After a
 * successful click, the button is disabled for 30s to discourage
 * mashing — the rate-limit handles abuse but the visible cooldown
 * makes the limit obvious before the user hits it server-side.
 */
export function ResendVerificationButton({ email }: { email: string }) {
  const t = useT()
  const [pending, startTransition] = useTransition()
  const [cooldown, setCooldown] = useState(0)

  function handleClick() {
    startTransition(async () => {
      const res = await resendVerificationEmailAction({ email })
      if (res.ok) {
        toast.success(t('verifyEmail.resend.success'))
        // 30s client-side cooldown — matches the typical email arrival
        // latency. Server still enforces the real limit (3/h).
        setCooldown(30)
        const interval = setInterval(() => {
          setCooldown((c) => {
            if (c <= 1) {
              clearInterval(interval)
              return 0
            }
            return c - 1
          })
        }, 1000)
      } else if (res.reason === 'rate_limit') {
        toast.error(t('verifyEmail.resend.rateLimit'))
      } else if (res.reason === 'invalid') {
        toast.error(t('verifyEmail.resend.invalid'))
      } else {
        toast.error(t('verifyEmail.resend.unavailable'))
      }
    })
  }

  const disabled = pending || cooldown > 0

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={disabled}
      aria-busy={pending}
    >
      {pending
        ? t('verifyEmail.resend.pending')
        : cooldown > 0
          ? t('verifyEmail.resend.cooldown', { seconds: cooldown })
          : t('verifyEmail.resend.cta')}
    </Button>
  )
}
