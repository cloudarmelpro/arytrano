'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { useT } from '@/lib/i18n/client'
import { formatAriary } from '@/lib/format/currency'
import { tenantPayLeaseAction } from '../actions/pay-lease'
import { tenantRefuseLeaseAction } from '../actions/sign-lease'
import { useLeaseAction } from './use-lease-action'

/**
 * Tenant-side action buttons for a PENDING_TENANT lease (revised E-T26).
 *
 * Two paths :
 *   - Accept + pay → Server Action `tenantPayLeaseAction` → redirects
 *     to GoalPay checkout for the platform fee (= 20% × monthly rent).
 *     After payment success the webhook flips the lease to ACTIVE.
 *   - Refuse → opens inline reason textarea → `tenantRefuseLeaseAction`
 *
 * The Pay CTA shows the exact amount the tenant will be charged so
 * there is no surprise at the GoalPay checkout screen.
 *
 * Memory rules : `feedback_shadcn_primitives_only`, `feedback_loading_states`,
 * `feedback_server_action_authn_guard`.
 */
export function LeaseTenantActions({
  leaseId,
  platformFeeMGA,
}: {
  leaseId: string
  /** Snapshot of what the tenant pays — shown on the Accept CTA. */
  platformFeeMGA: number
}) {
  const t = useT()
  const router = useRouter()
  const { pending, serverError, run } = useLeaseAction()
  const [refuseOpen, setRefuseOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [outcome, setOutcome] = useState<'refused' | null>(null)

  function acceptAndPay() {
    setOutcome(null)
    const fd = new FormData()
    fd.set('leaseId', leaseId)
    // Pay action does the GoalPay redirect server-side via redirect()
    // which throws. The Server Action result only surfaces an error
    // state — success never returns to the client.
    run(
      () => tenantPayLeaseAction({ ok: false }, fd),
      () => {
        // No-op on the "ok" return — only fires on already_paid case
        // (race between Accept clicks vs webhook). Refresh the page.
        router.refresh()
      },
    )
  }

  function refuse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setOutcome(null)
    const fd = new FormData()
    fd.set('leaseId', leaseId)
    fd.set('reason', reason)
    run(
      () => tenantRefuseLeaseAction({ ok: false }, fd),
      () => {
        setOutcome('refused')
        router.refresh()
      },
    )
  }

  const refuseErrorId = serverError ? 'lease-refuse-reason-error' : undefined

  return (
    <div className="flex flex-col gap-4" aria-busy={pending}>
      {!refuseOpen ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="lg"
            onClick={acceptAndPay}
            disabled={pending}
            className="gap-2 px-6"
          >
            {t('lease.tenant.cta.acceptAndPay', {
              amount: formatAriary(platformFeeMGA),
            })}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setRefuseOpen(true)}
            disabled={pending}
            className="px-6"
          >
            {t('lease.tenant.cta.refuse')}
          </Button>
        </div>
      ) : (
        <form onSubmit={refuse} className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5">
          <fieldset disabled={pending} className="contents">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="lease-refuse-reason">
                  {t('lease.tenant.refuse.reason.label')}
                </FieldLabel>
                <Input
                  id="lease-refuse-reason"
                  name="reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  placeholder={t('lease.tenant.refuse.reason.placeholder')}
                  aria-invalid={!!serverError}
                  aria-describedby={refuseErrorId}
                />
              </Field>
            </FieldGroup>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={pending} variant="destructive">
                {t('lease.tenant.refuse.confirm')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRefuseOpen(false)}
                disabled={pending}
              >
                {t('common.cancel' as const)}
              </Button>
            </div>
          </fieldset>
        </form>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {outcome === 'refused' ? t('lease.tenant.outcome.refused') : ''}
      </div>

      {serverError ? (
        <p
          id={refuseErrorId}
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13.5px] font-medium text-destructive"
        >
          {serverError}
        </p>
      ) : null}
    </div>
  )
}
