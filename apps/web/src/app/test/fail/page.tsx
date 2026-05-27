import type { Metadata } from 'next'
import { resolveLeaseHrefForReturn } from '@/features/payments/server'
import { TransactionResult } from '@/features/payments'

export const metadata: Metadata = {
  title: 'Paiement test échoué · AryTrano',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{
  reference?: string
  order_reference?: string
}>

/** GoalPay TEST mode — fail redirect. Mirror of `/transaction/fail`. */
export default async function TestFailPage({
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
