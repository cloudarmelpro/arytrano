import type { Metadata } from 'next'
import { auth } from '@/features/auth'
import { findLeaseByPaymentReference } from '@/features/payments'
import { TransactionResult } from '@/features/payments/components/TransactionResult'

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
      status="canceled"
      leaseHref={leaseHref}
      showLeaseLink={showLeaseLink}
    />
  )
}
