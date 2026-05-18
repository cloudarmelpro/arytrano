'use client'

import { useState, useTransition } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useT } from '@/lib/i18n/client'
import { resolveReportAction } from '../actions/resolve-report'

type Decision = 'RESOLVED' | 'DISMISSED'

/**
 * Admin action UI for a single report (polish workflow).
 *
 * Opens a single Dialog where the admin picks RESOLVED / DISMISSED AND writes
 * a note (5..500 chars, no control chars). The note is:
 *  - visible to the listing owner on their dashboard moderation section,
 *  - sent to the reporter by email if they're signed in.
 */
export function ReportActions({ reportId }: { reportId: string }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [decision, setDecision] = useState<Decision>('RESOLVED')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function reset() {
    setDecision('RESOLVED')
    setNote('')
    setError(null)
  }

  function submit() {
    setError(null)
    if (note.trim().length < 5) {
      setError(t('admin.reports.dialog.note.tooShort'))
      return
    }
    startTransition(async () => {
      const result = await resolveReportAction(reportId, decision, note.trim())
      if (result.ok) {
        toast.success(
          decision === 'RESOLVED'
            ? t('admin.reports.toast.resolved')
            : t('admin.reports.toast.dismissed'),
        )
        setOpen(false)
        reset()
      } else {
        toast.error(result.message ?? t('admin.reports.toast.error'))
        setError(result.message ?? null)
      }
    })
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <Dialog.Trigger
        render={
          <Button type="button" variant="default" size="sm">
            {t('admin.reports.dialog.openCta')}
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-card p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <Dialog.Title className="text-lg font-semibold text-foreground">
            {t('admin.reports.dialog.title')}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            {t('admin.reports.dialog.lead')}
          </Dialog.Description>

          <div className="mt-5 flex flex-col gap-4">
            <Field>
              <FieldLabel>{t('admin.reports.dialog.decision.label')}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(['RESOLVED', 'DISMISSED'] as const).map((d) => {
                  const active = decision === d
                  const label =
                    d === 'RESOLVED'
                      ? t('admin.reports.action.resolve')
                      : t('admin.reports.action.dismiss')
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDecision(d)}
                      disabled={pending}
                      aria-pressed={active}
                      className={`inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        active
                          ? d === 'RESOLVED'
                            ? 'border-success/40 bg-success/10 text-success'
                            : 'border-destructive/40 bg-destructive/10 text-destructive'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </Field>

            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="report-admin-note">
                {t('admin.reports.dialog.note.label')}
              </FieldLabel>
              <textarea
                id="report-admin-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={pending}
                rows={4}
                maxLength={500}
                placeholder={t('admin.reports.dialog.note.placeholder')}
                aria-invalid={!!error}
                aria-describedby={
                  error
                    ? 'report-admin-note-error report-admin-note-hint'
                    : 'report-admin-note-hint'
                }
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p id="report-admin-note-hint" className="text-xs text-muted-foreground">
                {t('admin.reports.dialog.note.hint')}
              </p>
              {error && (
                <FieldError id="report-admin-note-error" errors={[{ message: error }]} />
              )}
            </Field>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close
              render={
                <Button type="button" variant="outline" size="default" disabled={pending}>
                  {t('admin.reports.dialog.cancel')}
                </Button>
              }
            />
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={submit}
              disabled={pending}
              aria-busy={pending}
              className="inline-flex items-center gap-2"
            >
              {pending && (
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                  aria-hidden
                />
              )}
              {pending
                ? t('admin.reports.dialog.submitting')
                : t('admin.reports.dialog.submit')}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
