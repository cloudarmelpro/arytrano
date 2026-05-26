'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { rateLimiters } from '@/lib/rate-limit'
import { tenantSignLease } from '../services/tenant-sign-lease'
import { refuseLease } from '../services/refuse-lease'

export type SignLeaseActionState = {
  ok: boolean
  message?: string
}

/**
 * Tenant accepts the lease (PENDING_TENANT → ACTIVE).
 *
 * Auth : caller must be logged in AND be the tenant on the lease.
 * Service-side `tenant-sign-lease` re-checks `lease.tenantId === userId`,
 * so a leaked leaseId can't be signed by a third party.
 *
 * On success, revalidate the dashboard surfaces that show lease status.
 */
export async function tenantSignLeaseAction(
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

  const result = await tenantSignLease(leaseId, session.user.id)

  switch (result.kind) {
    case 'ok':
      revalidatePath('/dashboard/leases')
      revalidatePath(`/dashboard/leases/${leaseId}`)
      revalidatePath('/annonces')
      return { ok: true }
    case 'not_found':
      return { ok: false, message: t('lease.error.leaseNotFound') }
    case 'not_tenant':
      return { ok: false, message: t('lease.error.notTenant') }
    case 'invalid_status':
      return {
        ok: false,
        message: t('lease.error.cannotSign', {
          status: result.currentStatus,
        }),
      }
  }
}

/**
 * Tenant refuses the lease (PENDING_TENANT → REFUSED) and queues a
 * manual refund on the linked Payment if it was already CONFIRMED.
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
