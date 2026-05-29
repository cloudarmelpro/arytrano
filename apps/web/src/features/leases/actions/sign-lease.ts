'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { rateLimiters } from '@/lib/rate-limit'
import { refuseLease } from '../services/refuse-lease'

export type SignLeaseActionState = {
  ok: boolean
  message?: string
}

/**
 * Tenant refuses the lease (PENDING_TENANT → REFUSED). In the revised
 * E-T26 (2026-05-27) model, the tenant pays nothing if they refuse —
 * the platform fee is only charged on the Accept-and-pay path. The
 * Payment refund logic still runs as belt-and-suspenders for the edge
 * case where a tenant clicked Pay, succeeded at GoalPay, then clicked
 * Refuse before the webhook arrived to flip the lease to ACTIVE.
 *
 * The Accept path is now handled by `actions/pay-lease.ts`
 * (`tenantPayLeaseAction`) which redirects the tenant to GoalPay.
 */
export async function tenantRefuseLeaseAction(
  _prev: SignLeaseActionState,
  formData: FormData,
): Promise<SignLeaseActionState> {
  const locale = await getLocale()
  const t = getT(locale)

  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: t('lease.error.notAuthenticated') }
  }

  // SEC-M2 audit fix — bound stolen-bearer enumeration / runaway client.
  const rl = await rateLimiters.leaseAction(session.user.id)
  if (!rl.success) {
    return { ok: false, message: t('lease.error.rateLimit') }
  }

  const leaseId = formData.get('leaseId')
  if (typeof leaseId !== 'string' || !leaseId) {
    return { ok: false, message: t('lease.error.leaseNotFound') }
  }
  const reasonRaw = formData.get('reason')
  const reason =
    typeof reasonRaw === 'string' ? reasonRaw.trim().slice(0, 500) : ''

  const result = await refuseLease(leaseId, session.user.id, reason)

  switch (result.kind) {
    case 'ok':
      revalidatePath('/dashboard/leases')
      revalidatePath(`/dashboard/leases/${leaseId}`)
      return { ok: true }
    case 'not_found':
      return { ok: false, message: t('lease.error.leaseNotFound') }
    case 'not_tenant':
      return { ok: false, message: t('lease.error.notTenant') }
    case 'invalid_status':
      return {
        ok: false,
        message: t('lease.error.cannotRefuse', {
          status: result.currentStatus,
        }),
      }
  }
}
