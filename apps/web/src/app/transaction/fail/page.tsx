import type { Metadata } from 'next'
import { auth } from '@/features/auth'
import { findLeaseByPaymentReference } from '@/features/payments'
import { TransactionResult } from '@/features/payments/components/TransactionResult'

export const metadata: Metadata = {
  title: 'Paiement échoué · AryTrano',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{
  reference?: string
  order_reference?: string
}>

/**
 * GoalPay post-checkout redirect — failure branch. GoalPay routes
 * here when the Mobile Money operator rejected the payment (solde
 * insuffisant, opérateur down, KYC mismatch). The webhook will arrive
 * shortly with `payment.failed`. The Lease stays in DRAFT — the
 * owner can retry by relaunching the wizard, which generates a fresh
 * Payment row + idempotencyKey.
 *
 * Same state-source disclaimer as `/transaction/done`.
 */
export default async function TransactionFailPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const session = await auth()
  const reference = typeof sp.reference === 'string' ? sp.reference : null

  let leaseHref: string | null = null
  let showLeaseLink = false
  if (reference && session?.user?.id) {
    const r = await findLeaseByPaymentReference(reference)
    if (r && r.ownerUserId === session.user.id) {
      leaseHref = `/dashboard/leases/${r.leaseId}`
      showLeaseLink = true
    }
  }

  return (
    <TransactionResult
      status="fail"
      leaseHref={leaseHref}
      showLeaseLink={showLeaseLink}
    />
  )
}
