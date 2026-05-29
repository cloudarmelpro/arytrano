'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { rateLimiters } from '@/lib/rate-limit'
import { ownerCancelPendingLease } from '../services/owner-cancel-pending-lease'

export type CancelLeaseActionState = {
  ok: boolean
  message?: string
}

/**
 * Owner cancels a PENDING_TENANT lease (PENDING_TENANT → REFUSED) and
 * queues a manual refund on the linked Payment if it was CONFIRMED.
 *
 * Auth : caller MUST be logged in AND be the lease owner. Service-side
 * re-checks `lease.ownerId === userId`, so a leaked leaseId can't be
 * canceled by a third party.
 *
 * Memory rule `feedback_server_action_authn_guard` — every Server Action
 * with side effects guards on `await auth()` + reject if no session.
 */
export async function ownerCancelLeaseAction(
  _prev: CancelLeaseActionState,
  formData: FormData,
): Promise<CancelLeaseActionState> {
  const locale = await getLocale()
  const t = getT(locale)

  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: t('lease.error.notAuthenticated') }
  }

  // Reuse the lease-action rate limit bucket (20/h/userId) — same
  // anti-bearer-abuse posture as accept/refuse.
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

  const result = await ownerCancelPendingLease(
    leaseId,
    session.user.id,
    reason,
  )

  switch (result.kind) {
    case 'ok':
      revalidatePath('/dashboard/leases')
      revalidatePath(`/dashboard/leases/${leaseId}`)
      // Listing is freed by status flip — refresh the public grid + the
      // owner's listings dashboard.
      revalidatePath('/annonces')
      revalidatePath('/dashboard/listings')
      return { ok: true }
    case 'not_found':
      return { ok: false, message: t('lease.error.leaseNotFound') }
    case 'not_owner':
      return { ok: false, message: t('lease.error.notOwner') }
    case 'owner_terms_not_accepted':
      return {
        ok: false,
        message: t('onboarding.owner.terms.error.checkRequired'),
      }
    case 'invalid_status':
      return {
        ok: false,
        message: t('lease.error.cannotCancel', {
          status: result.currentStatus,
        }),
      }
  }
}
