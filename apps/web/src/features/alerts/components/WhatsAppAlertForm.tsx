'use client'

import { useState, useTransition } from 'react'
import { useT } from '@/lib/i18n/client'
import { Icon } from '@/components/shared/Icon'
import { subscribeWhatsAppAlertAction } from '../actions/subscribe-whatsapp-alert'
import { normalizeMgPhone } from '../schemas/whatsapp-alert'

type Status =
  | { type: 'idle' }
  | { type: 'success'; alreadySubscribed: boolean }
  | { type: 'error'; code: 'invalid' | 'rate_limit' | 'unavailable' }

export function WhatsAppAlertForm() {
  const t = useT()
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<Status>({ type: 'idle' })
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return
    // Client-side validation first — gives instant feedback on empty
    // or malformed numbers instead of round-tripping to the server
    // and showing a generic "invalid" toast 200ms later.
    if (!normalizeMgPhone(phone)) {
      setStatus({ type: 'error', code: 'invalid' })
      return
    }
    startTransition(async () => {
      try {
        const res = await subscribeWhatsAppAlertAction({ phone })
        if (res.ok) {
          setStatus({ type: 'success', alreadySubscribed: res.alreadySubscribed })
          if (!res.alreadySubscribed) setPhone('')
        } else {
          setStatus({ type: 'error', code: res.error })
        }
      } catch {
        // Server action threw (network drop, server 500, etc.). Without
        // this we'd leave the user staring at a form that has no error
        // state and no success — looks frozen.
        setStatus({ type: 'error', code: 'unavailable' })
      }
    })
  }

  // Success card replaces the form. Encourages closure — user knows
  // their submission landed without having to scan for a toast.
  // role="status" + aria-live="polite" announces the success to screen
  // readers since the visual form-→-success swap is invisible to them.
  if (status.type === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[14px] font-medium text-emerald-900"
      >
        <span
          aria-hidden
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"
        >
          <Icon name="check" size={14} />
        </span>
        <span>
          {status.alreadySubscribed
            ? t('footerV3.newsletter.alreadySubscribed')
            : t('footerV3.newsletter.success')}
        </span>
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex items-stretch gap-0 rounded-xl border border-border bg-muted/40 p-1"
        noValidate
      >
        <fieldset disabled={pending} className="contents">
          <span className="inline-flex items-center gap-2 border-r border-border px-3 text-[14px] font-semibold text-foreground/80">
            <Icon name="whatsapp" size={16} /> +261
          </span>
          <label htmlFor="footer-newsletter-phone" className="sr-only">
            {t('footerV3.newsletter.phoneLabel')}
          </label>
          <input
            id="footer-newsletter-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (status.type === 'error') setStatus({ type: 'idle' })
            }}
            placeholder={t('footerV3.newsletter.phonePlaceholder')}
            aria-invalid={status.type === 'error'}
            aria-describedby={
              status.type === 'error' ? 'footer-newsletter-error' : undefined
            }
            className="h-11 min-w-0 flex-1 bg-transparent px-3.5 text-[14.5px] font-medium text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13.5px] font-semibold text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending
              ? t('footerV3.newsletter.submitting')
              : t('footerV3.newsletter.submit')}{' '}
            {pending ? null : <Icon name="arrow-right" size={14} />}
          </button>
        </fieldset>
      </form>
      {status.type === 'error' ? (
        <p
          id="footer-newsletter-error"
          role="alert"
          className="mt-2 text-[12.5px] font-medium text-destructive"
        >
          {status.code === 'invalid'
            ? t('footerV3.newsletter.error.invalid')
            : status.code === 'rate_limit'
              ? t('footerV3.newsletter.error.rateLimit')
              : t('footerV3.newsletter.error.unavailable')}
        </p>
      ) : null}
    </div>
  )
}
