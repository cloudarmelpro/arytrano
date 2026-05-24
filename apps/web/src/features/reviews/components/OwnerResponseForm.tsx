'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import { respondToReviewAction } from '../actions/respond-to-review'

/**
 * Facebook-style nested reply input. Collapsed state = a slim "Répondre"
 * link (with reply-arrow icon) indented under the parent review.
 * Expanded state = a chat-style bubble with textarea + small action row.
 *
 * Indent (`ml-14`) mirrors the avatar column of `<OwnerResponseBubble>`
 * so the form previews exactly where the future bubble will sit (FB-style
 * staircase — child shifts right to align with the parent's bubble start).
 */
export function OwnerResponseForm({ reviewId }: { reviewId: string }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const trimmed = body.trim()
  const canSubmit = trimmed.length >= 10 && !pending

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    startTransition(async () => {
      const result = await respondToReviewAction(reviewId, trimmed)
      if (result.ok) {
        toast.success(t('reviews.ownerResponse.toast.saved'))
        setOpen(false)
        setBody('')
        return
      }
      setError(result.message ?? t('reviews.ownerResponse.toast.error'))
    })
  }

  if (!open) {
    return (
      <div className="py-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex w-fit items-center gap-1.5 self-start text-xs font-medium text-primary underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 17 4 12 9 7" />
            <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
          </svg>
          {t('reviews.ownerResponse.cta')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit}>
      <fieldset disabled={pending} className="flex flex-col gap-2">
        <div
          className={`flex w-full flex-col gap-1 rounded-2xl bg-muted px-3.5 py-2 transition focus-within:ring-2 focus-within:ring-ring ${
            error ? 'ring-2 ring-destructive' : ''
          }`}
        >
          <label
            htmlFor={`response-${reviewId}`}
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {t('reviews.ownerResponse.label')}
          </label>
          <textarea
            id={`response-${reviewId}`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder={t('reviews.ownerResponse.placeholder')}
            aria-invalid={!!error}
            autoFocus
            className="min-h-12 w-full resize-y bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {t('reviews.ownerResponse.hint')}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setBody('')
                setError(null)
              }}
              className="text-xs font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('reviews.authorActions.cancel')}
            </button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={!canSubmit}
              aria-busy={pending}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-xs"
            >
              {pending && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />
              )}
              {pending ? t('reviews.ownerResponse.submitting') : t('reviews.ownerResponse.submit')}
            </Button>
          </div>
        </div>
      </fieldset>
    </form>
  )
}
