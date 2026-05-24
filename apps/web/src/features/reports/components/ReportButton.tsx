'use client'

import { useMemo, useState, useTransition } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useT } from '@/lib/i18n/client'
import { submitReportAction } from '../actions/submit-report'
import { REPORT_REASONS } from '../schemas/create-report'

type Reason = (typeof REPORT_REASONS)[number]

/**
 * Public "Signaler" button on listing detail (T-025).
 * Anyone — signed in or anonymous — can submit. Server Action records the
 * report; rate-limit per IP keeps it from being abused.
 */
export function ReportButton({ listingId }: { listingId: string }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<Reason | ''>('')
  const [details, setDetails] = useState('')
  const [pending, startTransition] = useTransition()

  const reasonItems = useMemo(
    () =>
      REPORT_REASONS.map((r) => ({
        value: r,
        label: t(`report.reason.${r}` as const),
      })),
    [t],
  )

  function reset() {
    setReason('')
    setDetails('')
  }

  function onSubmit() {
    if (!reason) {
      toast.error(t('report.reason.placeholder'))
      return
    }
    startTransition(async () => {
      const fd = new FormData()
      fd.append('listingId', listingId)
      fd.append('reason', reason)
      if (details.trim()) fd.append('details', details.trim())
      const result = await submitReportAction({ ok: false }, fd)
      if (result.ok) {
        // Server returns a generic "thanks" message — we layer in the
        // transparency hint so signed-in reporters know to watch their inbox.
        toast.success(t('report.toast.signedInTransparent'), { duration: 6000 })
        setOpen(false)
        reset()
      } else {
        toast.error(result.message ?? t('report.toast.error'))
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-4 transition hover:text-destructive"
          >
            {t('report.cta')}
          </button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-card p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <Dialog.Title className="text-lg font-semibold text-foreground">
            {t('report.dialog.title')}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            {t('report.dialog.lead')}
          </Dialog.Description>

          <FieldGroup className="mt-5 flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="report-reason">{t('report.reason.label')}</FieldLabel>
              <Select
                value={reason}
                onValueChange={(v) => setReason((v ?? '') as Reason | '')}
                items={reasonItems}
                disabled={pending}
              >
                <SelectTrigger id="report-reason" className="h-10 w-full">
                  <SelectValue placeholder={t('report.reason.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {reasonItems.map((it) => (
                    <SelectItem key={it.value} value={it.value}>
                      {it.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="report-details">{t('report.details.label')}</FieldLabel>
              <textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={pending}
                rows={4}
                maxLength={1000}
                placeholder={t('report.details.placeholder')}
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              />
            </Field>
          </FieldGroup>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close
              render={
                <Button type="button" variant="outline" size="default" disabled={pending}>
                  {t('report.cancel')}
                </Button>
              }
            />
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={onSubmit}
              disabled={pending || !reason}
              aria-busy={pending}
              className="inline-flex items-center gap-2"
            >
              {pending && (
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                  aria-hidden
                />
              )}
              {pending ? t('report.submitting') : t('report.submit')}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
