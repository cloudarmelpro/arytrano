import type { Metadata } from 'next'
import { resolveLeaseHrefForReturn } from '@/features/payments/server'
import { TransactionResult } from '@/features/payments'

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
  const reference = typeof sp.reference === 'string' ? sp.reference : null
  const { leaseHref, showLeaseLink } = await resolveLeaseHrefForReturn(reference)

  return (
    <TransactionResult
      status="fail"
      leaseHref={leaseHref}
      showLeaseLink={showLeaseLink}
    />
  )
}
