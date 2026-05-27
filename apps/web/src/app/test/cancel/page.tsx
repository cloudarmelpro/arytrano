import type { Metadata } from 'next'
import { resolveLeaseHrefForReturn } from '@/features/payments/server'
import { TransactionResult } from '@/features/payments'

export const metadata: Metadata = {
  title: 'Paiement test annulé · AryTrano',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{
  reference?: string
  order_reference?: string
}>

/** GoalPay TEST mode — cancel redirect. Mirror of `/transaction/canceled`. */
export default async function TestCancelPage({
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
