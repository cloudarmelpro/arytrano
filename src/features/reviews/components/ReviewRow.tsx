'use client'

import { useState, useTransition } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { useT } from '@/lib/i18n/client'
import type { PublicReview } from '../queries/list-listing-reviews'
import type { ReviewReactionSnapshot } from '../queries/get-review-reactions'
import { StarRating } from './StarRating'
import { CommentActionsMenu } from './CommentActionsMenu'
import { OwnerResponseBubble } from './OwnerResponseBubble'
import { OwnerResponseForm } from './OwnerResponseForm'
import { ReviewReactions } from './ReviewReactions'
import { updateReviewAction } from '../actions/update-review'
import { deleteReviewAction } from '../actions/delete-review'

/**
 * Full review row — client component because Facebook-style edit mode
 * replaces the body with a textarea in place (state lives here, not in
 * a separate sibling component).
 *
 * Rendering rules:
 *  - Anyone sees the header (avatar + name + date), stars, body.
 *  - The review AUTHOR sees a kebab menu top-right with Modifier / Supprimer.
 *    Clicking Modifier swaps the body+stars for a textarea + interactive stars.
 *  - The listing OWNER sees a "Répondre" form under the review (or a
 *    reply bubble when a response already exists).
 */
export function ReviewRow({
  review,
  isMine,
  canRespond,
  ownerName,
  ownerImage,
  dateFormatLocale,
  initialReactions,
}: {
  review: PublicReview
  /** Current viewer is the review's author. */
  isMine: boolean
  /** Current viewer is the listing's owner — can reply to any review. */
  canRespond: boolean
  /** Listing owner's display name + image, for response bubble rendering. */
  ownerName: string
  ownerImage: string | null
  /** BCP-47 tag for date formatting (e.g. 'fr-FR'). */
  dateFormatLocale: string
  /** Pre-loaded reaction snapshot (counts + current viewer's reaction). */
  initialReactions: ReviewReactionSnapshot
}) {
  const t = useT()
  const [mode, setMode] = useState<'view' | 'editing'>('view')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [draftRating, setDraftRating] = useState(review.rating)
  const [draftBody, setDraftBody] = useState(review.body)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const dateFmt = new Intl.DateTimeFormat(dateFormatLocale, {
    month: 'long',
    year: 'numeric',
  })

  const trimmed = draftBody.trim()
  const canSave =
    draftRating >= 1 &&
    draftRating <= 5 &&
    trimmed.length >= 20 &&
    !pending &&
    (draftRating !== review.rating || trimmed !== review.body.trim())

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setError(null)
    startTransition(async () => {
      const result = await updateReviewAction(review.id, draftRating, trimmed)
      if (result.ok) {
        toast.success(t('reviews.authorActions.toast.updated'))
        setMode('view')
        return
      }
      setError(result.message ?? t('reviews.authorActions.toast.updateError'))
    })
  }

  function onDelete() {
    startTransition(async () => {
      const result = await deleteReviewAction(review.id)
      if (result.ok) {
        toast.success(t('reviews.authorActions.toast.deleted'))
        setConfirmDelete(false)
        return
      }
      toast.error(result.message ?? t('reviews.authorActions.toast.deleteError'))
      setConfirmDelete(false)
    })
  }

  return (
    <li className="relative flex flex-col gap-3">
      {/* HEADER — avatar + name INLINE on one row (FB pattern) */}
      <header className="flex items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border">
          {review.author.image && <AvatarImage src={review.author.image} alt={review.author.displayName} />}
          <AvatarFallback className="text-sm font-semibold text-primary">
            {review.author.displayName[0]?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">
            {review.author.displayName}
            {isMine && (
              <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                {t('reviews.authorActions.youBadge')}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {dateFmt.format(review.createdAt)}
          </p>
        </div>
      </header>

      {/* Kebab menu — top-right, only for the author and only in view mode */}
      {isMine && mode === 'view' && (
        <div className="absolute right-0 top-0">
          <CommentActionsMenu
            onEdit={() => {
              setDraftRating(review.rating)
              setDraftBody(review.body)
              setError(null)
              setMode('editing')
            }}
            onDelete={() => setConfirmDelete(true)}
            triggerAriaLabel={t('commentActions.menuAria')}
          />
        </div>
      )}

      {/* Body — either read-only OR edit form (FB-style in-place edit) */}
      {mode === 'editing' ? (
        <form onSubmit={onSave} className="flex flex-col gap-3 rounded-md border border-border bg-card p-4">
          <fieldset disabled={pending} className="flex flex-col gap-3">
            <Field>
              <FieldLabel htmlFor={`edit-rating-${review.id}`}>
                {t('reviews.form.rating.label')}
              </FieldLabel>
              <StarRating
                value={draftRating}
                onChange={setDraftRating}
                size={24}
                ariaLabel={t('reviews.form.rating.aria')}
              />
            </Field>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor={`edit-body-${review.id}`}>
                {t('reviews.form.body.label')}
              </FieldLabel>
              <textarea
                id={`edit-body-${review.id}`}
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                rows={4}
                maxLength={2000}
                aria-invalid={!!error}
                aria-describedby={
                  error
                    ? `edit-body-${review.id}-error edit-body-${review.id}-hint`
                    : `edit-body-${review.id}-hint`
                }
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              />
              <FieldDescription id={`edit-body-${review.id}-hint`}>
                {t('reviews.form.body.hint')}
              </FieldDescription>
              {error && (
                <FieldError id={`edit-body-${review.id}-error`} errors={[{ message: error }]} />
              )}
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => {
                  setMode('view')
                  setDraftRating(review.rating)
                  setDraftBody(review.body)
                  setError(null)
                }}
              >
                {t('reviews.authorActions.cancel')}
              </Button>
              <Button
                type="submit"
                variant="default"
                size="default"
                disabled={!canSave}
                aria-busy={pending}
                className="inline-flex items-center gap-2"
              >
                {pending && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />
                )}
                {pending
                  ? t('reviews.authorActions.saving')
                  : t('reviews.authorActions.save')}
              </Button>
            </div>
          </fieldset>
        </form>
      ) : (
        // Content sits naturally inside the right column — no pl needed
        // because the LEFT rail column already holds the avatar gutter.
        <>
          <StarRating value={review.rating} size={14} />
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {review.body}
          </p>
          {/* Reactions bar (J'aime / J'aime pas) */}
          <ReviewReactions reviewId={review.id} initial={initialReactions} />
        </>
      )}

      {/* Owner response — bubble (with its own kebab if owner) or reply form.
         Wrapped in a thin LEFT BORDER strip that visually descends along the
         J'aime button column (the border sits at x≈20, aligned with the
         J'aime icon's center inside `<ReviewReactions>` above). */}
      {review.ownerResponse ? (
        <div className="ml-5 border-l-2 border-border pl-4">
          <OwnerResponseBubble
            reviewId={review.id}
            body={review.ownerResponse}
            ownerName={ownerName}
            ownerImage={ownerImage}
            canEdit={canRespond}
          />
        </div>
      ) : canRespond ? (
        <div className="ml-5 border-l-2 border-border pl-4">
          <OwnerResponseForm reviewId={review.id} />
        </div>
      ) : null}

      <Dialog.Root open={confirmDelete} onOpenChange={setConfirmDelete}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-card p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {t('reviews.authorActions.deleteConfirm.title')}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              {t('reviews.authorActions.deleteConfirm.lead')}
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close
                render={
                  <Button type="button" variant="outline" size="default" disabled={pending}>
                    {t('reviews.authorActions.cancel')}
                  </Button>
                }
              />
              <Button
                type="button"
                variant="destructive"
                size="default"
                onClick={onDelete}
                disabled={pending}
                aria-busy={pending}
                className="inline-flex items-center gap-2"
              >
                {pending && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground" aria-hidden />
                )}
                {pending
                  ? t('reviews.authorActions.deleting')
                  : t('reviews.authorActions.confirmDelete')}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </li>
  )
}
