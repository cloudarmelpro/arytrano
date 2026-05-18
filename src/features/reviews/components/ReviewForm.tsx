'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { useT } from '@/lib/i18n/client'
import { submitReviewAction } from '../actions/submit-review'
import { StarRating } from './StarRating'

/**
 * Review submission form. Auth-gated server-side — anonymous visitors are
 * redirected to sign-in with returnTo capture.
 *
 * State machine:
 *  - idle (rating=0): submit disabled
 *  - rated (rating>=1, body too short): textarea visible, submit disabled
 *  - ready: submit enabled
 *  - submitting: fieldset disabled
 *  - submitted: form replaced by a success card
 */
export function ReviewForm({ listingId }: { listingId: string }) {
  const t = useT()
  const router = useRouter()
  const pathname = usePathname()
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmed = body.trim()
  const canSubmit = rating >= 1 && rating <= 5 && trimmed.length >= 20 && !pending

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    startTransition(async () => {
      const result = await submitReviewAction(listingId, rating, trimmed)
      if (result.ok) {
        setSubmitted(true)
        toast.success(t('reviews.toast.submitted'))
        return
      }
      if (result.needsAuth) {
        const returnTo = encodeURIComponent(pathname)
        router.push(`/sign-in?returnTo=${returnTo}`)
        return
      }
      setError(result.message ?? t('reviews.toast.error'))
    })
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-5 text-sm text-foreground">
        <p className="font-medium text-success">{t('reviews.form.thanksTitle')}</p>
        <p className="mt-1 text-muted-foreground">{t('reviews.form.thanksLead')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <header>
        <h3 className="text-base font-semibold text-foreground">
          {t('reviews.form.title')}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t('reviews.form.lead')}
        </p>
      </header>

      <fieldset disabled={pending} className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="review-rating">{t('reviews.form.rating.label')}</FieldLabel>
          <StarRating
            value={rating}
            onChange={setRating}
            size={28}
            ariaLabel={t('reviews.form.rating.aria')}
          />
        </Field>

        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="review-body">{t('reviews.form.body.label')}</FieldLabel>
          <textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder={t('reviews.form.body.placeholder')}
            aria-invalid={!!error}
            aria-describedby={error ? 'review-body-error review-body-hint' : 'review-body-hint'}
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldDescription id="review-body-hint">{t('reviews.form.body.hint')}</FieldDescription>
          {error && <FieldError id="review-body-error" errors={[{ message: error }]} />}
        </Field>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="default"
            size="default"
            disabled={!canSubmit}
            aria-busy={pending}
            className="inline-flex items-center gap-2"
          >
            {pending && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />
            )}
            {pending ? t('reviews.form.submitting') : t('reviews.form.submit')}
          </Button>
        </div>
      </fieldset>
    </form>
  )
}
