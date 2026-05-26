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
 */
export function LeaseTenantActions({ leaseId }: { leaseId: string }) {
  const t = useT()
  const router = useRouter()
  const { pending, serverError, run } = useLeaseAction()
  const [refuseOpen, setRefuseOpen] = useState(false)
  const [reason, setReason] = useState('')

  function accept() {
    const fd = new FormData()
    fd.set('leaseId', leaseId)
    run(
      () => tenantSignLeaseAction({ ok: false }, fd),
      () => router.refresh(),
    )
  }

  function refuse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('leaseId', leaseId)
    fd.set('reason', reason)
    run(
      () => tenantRefuseLeaseAction({ ok: false }, fd),
      () => router.refresh(),
    )
  }

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

      {serverError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13.5px] font-medium text-destructive"
        >
          {serverError}
        </p>
      ) : null}
    </div>
  )
}
