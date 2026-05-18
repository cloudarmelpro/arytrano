'use client'

import { useState, useTransition } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useT } from '@/lib/i18n/client'
import { suspendListingAction } from '../actions/suspend-listing'

/**
 * Admin "Suspend" button (T-024). Opens a Base UI Dialog with a free-text
 * reason field — required, min 5 chars / max 500. Submits via Server Action
 * which records the reason, bumps `suspendedAt/By`, and emails the owner.
 */
export function SuspendListingButton({
  listingId,
  listingTitle,
}: {
  listingId: string
  listingTitle: string
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit() {
    setError(null)
    if (reason.trim().length < 5) {
      setError(t('admin.suspend.error.tooShort'))
      return
    }
    startTransition(async () => {
      const fd = new FormData()
      fd.append('listingId', listingId)
      fd.append('reason', reason.trim())
      const result = await suspendListingAction({ ok: false }, fd)
      if (result.ok) {
        toast.success(result.message ?? t('admin.suspend.toast.success'))
        setOpen(false)
        setReason('')
      } else {
        toast.error(result.message ?? t('admin.suspend.toast.error'))
        setError(result.message ?? null)
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button type="button" variant="destructive" size="sm">
            {t('admin.suspend.cta')}
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-card p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <Dialog.Title className="text-lg font-semibold text-destructive">
            {t('admin.suspend.dialog.title')}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            {t('admin.suspend.dialog.lead', { title: listingTitle })}
          </Dialog.Description>

          <div className="mt-5">
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="suspend-reason">
                {t('admin.suspend.reason.label')}
              </FieldLabel>
              <textarea
                id="suspend-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={pending}
                rows={4}
                maxLength={500}
                placeholder={t('admin.suspend.reason.placeholder')}
                aria-invalid={!!error}
                aria-describedby={error ? 'suspend-reason-error' : undefined}
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              />
              {error && <FieldError id="suspend-reason-error" errors={[{ message: error }]} />}
            </Field>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close
              render={
                <Button type="button" variant="outline" size="default" disabled={pending}>
                  {t('admin.suspend.cancel')}
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              size="default"
              onClick={onSubmit}
              disabled={pending}
              aria-busy={pending}
              className="inline-flex items-center gap-2"
            >
              {pending && (
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground"
                  aria-hidden
                />
              )}
              {pending ? t('admin.suspend.submitting') : t('admin.suspend.confirm')}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
