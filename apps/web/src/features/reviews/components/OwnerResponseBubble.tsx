'use client'

import { useState, useTransition } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import { respondToReviewAction } from '../actions/respond-to-review'
import { deleteOwnerResponseAction } from '../actions/delete-owner-response'
import { CommentActionsMenu } from './CommentActionsMenu'

/**
 * Facebook-style nested reply bubble for the owner's response.
 *
 * Layout (with the curved connector drawn from the parent):
 *
 *    ╮
 *    │
 *    ╰─ [Avatar]  ╭─ Tanguy · [Propriétaire] ─╮
 *                 │ Reply body wraps here     │
 *                 ╰───────────────────────────╯
 *                 [Modifier] [Supprimer]      ← only if `canEdit`
 *
 * When `canEdit` is true, owner-only inline edit + delete controls appear
 * under the bubble. Edit swaps the bubble for a textarea; delete asks for
 * confirmation in a Base UI Dialog.
 */
export function OwnerResponseBubble({
  reviewId,
  body,
  ownerName,
  ownerImage,
  canEdit,
}: {
  reviewId: string
  body: string
  ownerName: string
  ownerImage: string | null
  /** True when the current viewer is the listing owner (= response author). */
  canEdit: boolean
}) {
  const t = useT()
  const [mode, setMode] = useState<'view' | 'editing'>('view')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [draft, setDraft] = useState(body)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const trimmed = draft.trim()
  const canSave =
    trimmed.length >= 10 && !pending && trimmed !== body.trim()

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setError(null)
    startTransition(async () => {
      const result = await respondToReviewAction(reviewId, trimmed)
      if (result.ok) {
        toast.success(t('reviews.ownerResponse.toast.updated'))
        setMode('view')
        return
      }
      setError(result.message ?? t('reviews.ownerResponse.toast.error'))
    })
  }

  function onDelete() {
    startTransition(async () => {
      const result = await deleteOwnerResponseAction(reviewId)
      if (result.ok) {
        toast.success(t('reviews.ownerResponse.toast.deleted'))
        setConfirmDelete(false)
        return
      }
      toast.error(result.message ?? t('reviews.ownerResponse.toast.deleteError'))
      setConfirmDelete(false)
    })
  }

  return (
    // The continuous vertical line is provided by the parent wrapper in
    // ReviewRow (`border-l-2 pl-4`). This component just lays out the
    // nested avatar + bubble + actions.
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 ring-1 ring-border">
        {ownerImage && <AvatarImage src={ownerImage} alt={ownerName} />}
        <AvatarFallback className="text-xs font-semibold text-primary">
          {ownerName[0]?.toUpperCase() ?? '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {mode === 'view' ? (
          <div className="group relative inline-flex w-fit max-w-full items-start gap-1">
            <div className="inline-flex w-fit max-w-full flex-col rounded-2xl bg-muted px-3.5 py-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-foreground">
                  {ownerName}
                </span>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary">
                  {t('reviews.ownerResponse.badge')}
                </span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {body}
              </p>
            </div>

            {canEdit && (
              <CommentActionsMenu
                onEdit={() => {
                  setDraft(body)
                  setMode('editing')
                }}
                onDelete={() => setConfirmDelete(true)}
                triggerAriaLabel={t('commentActions.menuAria')}
              />
            )}
          </div>
        ) : (
          <form onSubmit={onSave}>
            <fieldset disabled={pending} className="flex flex-col gap-2">
              <div
                className={`flex w-full flex-col gap-1 rounded-2xl bg-muted px-3.5 py-2 transition focus-within:ring-2 focus-within:ring-ring ${
                  error ? 'ring-2 ring-destructive' : ''
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('reviews.ownerResponse.label')}
                </span>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  maxLength={1000}
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
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('view')
                    setDraft(body)
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
                  disabled={!canSave}
                  aria-busy={pending}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-xs"
                >
                  {pending && (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />
                  )}
                  {pending
                    ? t('reviews.authorActions.saving')
                    : t('reviews.authorActions.save')}
                </Button>
              </div>
            </fieldset>
          </form>
        )}
      </div>

      <Dialog.Root open={confirmDelete} onOpenChange={setConfirmDelete}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-card p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {t('reviews.ownerResponse.deleteConfirm.title')}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              {t('reviews.ownerResponse.deleteConfirm.lead')}
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
    </div>
  )
}

