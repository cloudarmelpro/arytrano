import type { Metadata } from 'next'
import { resolveLeaseHrefForReturn } from '@/features/payments/server'
import { TransactionResult } from '@/features/payments'

export const metadata: Metadata = {
  title: 'Paiement annulé · AryTrano',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{
  reference?: string
  order_reference?: string
}>

/**
 * GoalPay post-checkout redirect — cancel branch. The visitor closed
 * the GoalPay window before completing the Mobile Money flow. The
 * webhook may or may not arrive (GoalPay sends `payment.canceled`
 * after a TTL) ; meanwhile the Lease stays in DRAFT.
 *
 * Same state-source disclaimer as `/transaction/done` : we never
 * mutate state from this redirect.
 */
export default async function TransactionCanceledPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const reference = typeof sp.reference === 'string' ? sp.reference : null
  const { leaseHref, showLeaseLink } = await resolveLeaseHrefForReturn(reference)

  return (
    <TransactionResult
      status="canceled"
      leaseHref={leaseHref}
      showLeaseLink={showLeaseLink}
    />
  )
}
