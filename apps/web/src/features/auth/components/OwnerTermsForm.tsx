'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useT } from '@/lib/i18n/client'
import { acceptOwnerTermsAction } from '../actions/accept-owner-terms'

/**
 * Owner Terms acceptance form (T-049). Rendered on
 * `/onboarding/owner/terms`. A single required checkbox + submit
 * button. Submit redirects to /dashboard via redirect() in the action.
 *
 * Memory rules :
 *   - `feedback_shadcn_primitives_only` : Checkbox + Button from shadcn
 *   - `feedback_loading_states` : disable both inputs during pending
 */
export function OwnerTermsForm() {
  const t = useT()
  const [pending, startTransition] = useTransition()
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!accepted) {
      setError(t('onboarding.owner.terms.error.checkRequired'))
      return
    }
    const formData = new FormData()
    formData.set('accepted', 'on')
    startTransition(async () => {
      const result = await acceptOwnerTermsAction({ ok: false }, formData)
      // On ok, the action calls redirect() so this branch never returns
      // a success state — only error paths surface here.
      if (!result.ok && result.message) {
        setError(result.message)
      }
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5"
      aria-busy={pending}
    >
      <fieldset disabled={pending} className="contents">
        {/* A11y audit C-1 round 2 (2026-06-08) — shadcn `Checkbox`
            renders `<button role="checkbox">`, which is NOT a
            labelable element per HTML spec, so `<label htmlFor>` was
            silently ignored by screen readers. The accessible name
            now comes from `aria-labelledby` on the Checkbox pointing
            at the visible text span. The wrapping `<label>` stays
            for the visual click target (clicks within label bounds
            still activate descendant buttons), but the SR
            association is established via aria-labelledby. */}
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-4 transition hover:border-foreground/30">
          <Checkbox
            id="owner-terms-accepted"
            name="accepted"
            checked={accepted}
            onCheckedChange={(v) => {
              setAccepted(v === true)
              if (v === true) setError(null)
            }}
            aria-labelledby="owner-terms-label"
            aria-invalid={!!error}
            aria-describedby={error ? 'owner-terms-error' : undefined}
            className="mt-0.5"
          />
          <span
            id="owner-terms-label"
            className="text-[14.5px] leading-[1.55] text-foreground/80"
          >
            {t('onboarding.owner.terms.checkbox')}
          </span>
        </label>

        {error ? (
          <p
            id="owner-terms-error"
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13.5px] font-medium text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div>
          <Button
            type="submit"
            size="lg"
            disabled={pending || !accepted}
            className="px-7"
          >
            {pending
              ? t('onboarding.owner.terms.cta.loading')
              : t('onboarding.owner.terms.cta')}
          </Button>
        </div>
      </fieldset>
    </form>
  )
}
