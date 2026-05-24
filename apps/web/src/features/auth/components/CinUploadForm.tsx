'use client'

import { useActionState, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import { submitCinAction } from '../actions/submit-cin'

type CinStatusBanner =
  | { state: 'none' }
  | { state: 'pending'; submittedAt: string }
  | { state: 'verified'; verifiedAt: string }
  | { state: 'rejected'; rejectedAt: string; reason: string | null }

/**
 * Owner CIN upload form (T-038). Renders the current verification state
 * (none / pending / verified / rejected) above a file picker. Submission
 * goes through the Server Action which encrypts in-process.
 */
export function CinUploadForm({ status }: { status: CinStatusBanner }) {
  const t = useT()
  const [state, formAction, pending] = useActionState(submitCinAction, {
    ok: false,
  })
  const [fileName, setFileName] = useState<string | null>(null)

  // Surface success / error toasts on each transition.
  if (state.ok && state.message && !pending) {
    // Fire-and-forget — useActionState doesn't expose a "consumed" flag
    // but the toast component dedups by content.
    toast.success(state.message)
  }

  return (
    <div className="flex flex-col gap-6">
      <StatusBanner status={status} t={t} />

      <form action={formAction} className="flex flex-col gap-4">
        <fieldset disabled={pending} className="contents">
          <label className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center transition hover:bg-muted/50">
            <span className="text-sm font-medium text-foreground">
              {fileName ?? t('verifyOwner.upload.placeholder')}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('verifyOwner.upload.hint')}
            </span>
            <input
              type="file"
              name="cin"
              accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
              required
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              className="sr-only"
            />
          </label>

          {state.message && !state.ok && (
            <p role="alert" className="text-sm text-destructive">
              {state.message}
            </p>
          )}

          <Button
            type="submit"
            variant="default"
            size="default"
            disabled={pending || !fileName}
            aria-busy={pending}
            className="self-start"
          >
            {pending
              ? t('verifyOwner.upload.submitting')
              : status.state === 'rejected' || status.state === 'verified'
                ? t('verifyOwner.upload.resubmit')
                : t('verifyOwner.upload.submit')}
          </Button>
        </fieldset>
      </form>
    </div>
  )
}

function StatusBanner({
  status,
  t,
}: {
  status: CinStatusBanner
  t: ReturnType<typeof useT>
}) {
  if (status.state === 'none') {
    return (
      <p className="text-sm text-muted-foreground">
        {t('verifyOwner.status.none')}
      </p>
    )
  }
  if (status.state === 'pending') {
    return (
      <div className="rounded-md bg-muted/40 p-3 text-sm">
        <p className="font-medium text-foreground">
          {t('verifyOwner.status.pending.title')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('verifyOwner.status.pending.lead')}
        </p>
      </div>
    )
  }
  if (status.state === 'verified') {
    return (
      <div className="rounded-md bg-success/10 p-3 text-sm">
        <p className="font-medium text-success">
          {t('verifyOwner.status.verified.title')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('verifyOwner.status.verified.lead')}
        </p>
      </div>
    )
  }
  return (
    <div className="rounded-md bg-destructive/10 p-3 text-sm">
      <p className="font-medium text-destructive">
        {t('verifyOwner.status.rejected.title')}
      </p>
      {status.reason && (
        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
          {status.reason}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {t('verifyOwner.status.rejected.lead')}
      </p>
    </div>
  )
}
