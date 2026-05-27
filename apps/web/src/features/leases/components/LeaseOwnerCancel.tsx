'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { useT } from '@/lib/i18n/client'
import { ownerCancelLeaseAction } from '../actions/cancel-lease'
import { useLeaseAction } from './use-lease-action'

/**
 * Owner-side cancel button for a PENDING_TENANT lease.
 *
 * Use case : tenant never accepted (lost interest, unreachable) OR
 * owner changed their mind. Without this, the lease stays PENDING_TENANT
 * forever and the listing remains masked via the partial unique index.
 *
 * UX :
 *   - Default state : a single outline destructive button
 *   - Click → inline form opens (mirrors LeaseTenantActions.refuse) with
 *     optional reason input + warning about refund policy
 *   - Submit → Server Action → router.refresh()
 *
 * Memory rules respected :
 *   - `feedback_shadcn_primitives_only` : Field/FieldLabel/Input/Button
 *   - `feedback_loading_states` : fieldset disabled={pending} + lifted state
 *   - `feedback_server_action_authn_guard` : action does `await auth()`
 *
 * The aria-live region announces the outcome before router.refresh()
 * rewinds the DOM, matching the pattern in LeaseTenantActions.
 */
export function LeaseOwnerCancel({ leaseId }: { leaseId: string }) {
  const t = useT()
  const router = useRouter()
  const { pending, serverError, run } = useLeaseAction()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [outcome, setOutcome] = useState<'canceled' | null>(null)

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setOutcome(null)
    const fd = new FormData()
    fd.set('leaseId', leaseId)
    fd.set('reason', reason)
    run(
      () => ownerCancelLeaseAction({ ok: false }, fd),
      () => {
        setOutcome('canceled')
        router.refresh()
      },
    )
  }

  const errorId = serverError ? 'lease-cancel-reason-error' : undefined

  return (
    <div className="flex flex-col gap-4" aria-busy={pending}>
      {!confirmOpen ? (
        <div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setConfirmOpen(true)}
            disabled={pending}
            className="px-6 text-destructive"
          >
            {t('lease.owner.cancel.cta')}
          </Button>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="flex flex-col gap-4 rounded-2xl border border-destructive/30 bg-destructive/[0.03] p-5"
        >
          <p className="text-[13.5px] leading-[1.55] text-foreground/75">
            {t('lease.owner.cancel.warning')}
          </p>
          <fieldset disabled={pending} className="contents">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="lease-cancel-reason">
                  {t('lease.owner.cancel.reason.label')}
                </FieldLabel>
                <Input
                  id="lease-cancel-reason"
                  name="reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  placeholder={t('lease.owner.cancel.reason.placeholder')}
                  aria-invalid={!!serverError}
                  aria-describedby={
                    errorId
                      ? `lease-cancel-reason-help ${errorId}`
                      : 'lease-cancel-reason-help'
                  }
                />
                <FieldDescription id="lease-cancel-reason-help">
                  {t('lease.owner.cancel.reason.help')}
                </FieldDescription>
              </Field>
            </FieldGroup>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={pending} variant="destructive">
                {t('lease.owner.cancel.confirm')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmOpen(false)}
                disabled={pending}
              >
                {t('common.cancel' as const)}
              </Button>
            </div>
          </fieldset>
        </form>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {outcome === 'canceled' ? t('lease.owner.cancel.outcome') : ''}
      </div>

      {serverError ? (
        <p
          id={errorId}
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13.5px] font-medium text-destructive"
        >
          {serverError}
        </p>
      ) : null}
    </div>
  )
}
