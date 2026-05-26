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
import {
  tenantSignLeaseAction,
  tenantRefuseLeaseAction,
} from '../actions/sign-lease'
import { useLeaseAction } from './use-lease-action'

/**
 * Tenant-side action buttons for a PENDING_TENANT lease.
 *
 * Two paths:
 *   - Accept    → Server Action tenantSignLeaseAction → Lease ACTIVE
 *   - Refuse    → opens inline reason textarea → tenantRefuseLeaseAction
 *
 * Both Server Actions revalidate the lease detail + list pages.
 *
 * A11Y-H1 audit fix — the `aria-live="polite"` status region announces
 * the outcome to screen readers BEFORE `router.refresh()` re-renders
 * the page. Without this, a tenant clicking "Accepter" or "Refuser"
 * gets no programmatic confirmation that the action succeeded.
 */
export function LeaseTenantActions({ leaseId }: { leaseId: string }) {
  const t = useT()
  const router = useRouter()
  const { pending, serverError, run } = useLeaseAction()
  const [refuseOpen, setRefuseOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [outcome, setOutcome] = useState<'signed' | 'refused' | null>(null)

  function accept() {
    setOutcome(null)
    const fd = new FormData()
    fd.set('leaseId', leaseId)
    run(
      () => tenantSignLeaseAction({ ok: false }, fd),
      () => {
        setOutcome('signed')
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
            onClick={accept}
            disabled={pending}
            className="gap-2 px-6"
          >
            {t('lease.tenant.cta.accept')}
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

      {/* Outcome announcement — aria-live="polite" so accept/refuse
          success is read out before router.refresh() rewinds the DOM. */}
      <div role="status" aria-live="polite" className="sr-only">
        {outcome === 'signed'
          ? t('lease.tenant.outcome.signed')
          : outcome === 'refused'
            ? t('lease.tenant.outcome.refused')
            : ''}
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
