import 'server-only'
import { auth } from '@/features/auth'
import { findLeaseByPaymentReference } from './find-lease-by-payment-reference'

export type ResolveLeaseHrefForReturnResult = {
  leaseHref: string | null
  showLeaseLink: boolean
}

/**
 * Resolves the dashboard lease URL for a GoalPay return page, gated by
 * ownership. Used by `/transaction/*` and `/test/*` pages.
 *
 * Behaviour :
 *   - missing reference                       → { null, false }
 *   - no session                              → { null, false }
 *   - payment not found OR caller ≠ owner    → { null, false }
 *   - caller is the lease owner               → { href, true }
 *
 * Never mutates state — the GoalPay webhook (HMAC-verified) is the sole
 * source of truth for Payment / Lease transitions. This helper only
 * builds a display link, and gates its disclosure to the owner.
 *
 * `auth()` and the Prisma lookup run in parallel when both inputs are
 * sufficient. Saves ~50-120ms TTFB on 3G vs sequential.
 */
export async function resolveLeaseHrefForReturn(
  reference: string | undefined | null,
): Promise<ResolveLeaseHrefForReturnResult> {
  if (!reference) return { leaseHref: null, showLeaseLink: false }
  const [session, r] = await Promise.all([
    auth(),
    findLeaseByPaymentReference(reference),
  ])
  if (!session?.user?.id || !r || r.ownerUserId !== session.user.id) {
    return { leaseHref: null, showLeaseLink: false }
  }
  return { leaseHref: `/dashboard/leases/${r.leaseId}`, showLeaseLink: true }
}
