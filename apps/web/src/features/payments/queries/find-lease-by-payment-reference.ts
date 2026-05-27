import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Look up the Lease attached to a payment by the merchant-side
 * `reference` field (= `Payment.idempotencyKey`).
 *
 * Used by the post-checkout return pages (`/transaction/done`,
 * `/canceled`, `/fail`) to redirect the user back to the right
 * `/dashboard/leases/[id]` once GoalPay sends them home with the
 * reference as a query string.
 *
 * Returns null if no Payment matches OR if the Payment doesn't link
 * to a Lease (PREMIUM_LISTING / FEATURED_PLACEMENT legacy purposes).
 *
 * No auth check — caller is responsible for verifying the requesting
 * user is the lease owner before exposing the leaseId. The return
 * pages today do require `auth()` AND match `payment.userId === session.user.id`.
 */
export type LeaseForTransactionReturn = {
  leaseId: string
  paymentId: string
  paymentStatus:
    | 'INITIATED'
    | 'PENDING'
    | 'CONFIRMED'
    | 'FAILED'
    | 'CANCELED'
    | 'EXPIRED'
    | 'REFUND_PENDING'
    | 'REFUNDED'
  ownerUserId: string
  listingSlug: string
  citySlug: string
}

export async function findLeaseByPaymentReference(
  reference: string,
): Promise<LeaseForTransactionReturn | null> {
  const payment = await prisma.payment.findUnique({
    where: { idempotencyKey: reference },
    select: {
      id: true,
      status: true,
      userId: true,
      lease: {
        select: {
          id: true,
          listing: { select: { slug: true, city: { select: { slug: true } } } },
        },
      },
    },
  })
  if (!payment || !payment.lease) return null
  return {
    leaseId: payment.lease.id,
    paymentId: payment.id,
    paymentStatus: payment.status,
    ownerUserId: payment.userId,
    listingSlug: payment.lease.listing.slug,
    citySlug: payment.lease.listing.city.slug,
  }
}
