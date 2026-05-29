'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { rateLimiters } from '@/lib/rate-limit'
import { tenantInitiatePayment } from '../services/tenant-initiate-payment'

export type PayLeaseActionState = {
  ok: boolean
  message?: string
  /** Set when service returns ok — Server Action calls redirect() and never returns this to the client, but type-safe for the form hook. */
  checkoutUrl?: string
}

/**
 * Tenant initiates payment on a PENDING_TENANT lease (revised E-T26).
 *
 * The tenant clicks "Accepter et payer" on the lease detail page.
 * This action :
 *   1. Auth-gates (must be signed in, must be the lease tenant)
 *   2. Rate-limits via the leaseAction bucket (20/h/userId)
 *   3. Creates a Payment row + calls GoalPay
 *   4. Redirects to GoalPay's checkout URL
 *
 * Memory rule `feedback_server_action_authn_guard` — every action does
 * `await auth()` first.
 */
export async function tenantPayLeaseAction(
  _prev: PayLeaseActionState,
  formData: FormData,
): Promise<PayLeaseActionState> {
  const locale = await getLocale()
  const t = getT(locale)

  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: t('lease.error.notAuthenticated') }
  }

  const rl = await rateLimiters.leaseAction(session.user.id)
  if (!rl.success) {
    return { ok: false, message: t('lease.error.rateLimit') }
  }

  const leaseId = formData.get('leaseId')
  if (typeof leaseId !== 'string' || !leaseId) {
    return { ok: false, message: t('lease.error.leaseNotFound') }
  }

  const result = await tenantInitiatePayment(leaseId, session.user.id)

  switch (result.kind) {
    case 'ok':
      // Redirect to GoalPay checkout. Use a 303 so the browser follows
      // it as a GET (POST → GET pattern). Next's redirect() throws.
      redirect(result.checkoutUrl)
    case 'already_paid':
      // Webhook may be in flight. Refresh the page so the user sees
      // the in-progress state instead of double-charging.
      revalidatePath(`/dashboard/leases/${leaseId}`)
      return { ok: false, message: t('lease.error.alreadyPaid') }
    case 'lease_not_found':
      return { ok: false, message: t('lease.error.leaseNotFound') }
    case 'not_tenant':
      return { ok: false, message: t('lease.error.notTenant') }
    case 'invalid_status':
      return {
        ok: false,
        message: t('lease.error.cannotPay', { status: result.currentStatus }),
      }
  }
}
