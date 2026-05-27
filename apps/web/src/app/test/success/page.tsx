import type { Metadata } from 'next'
import { auth } from '@/features/auth'
import { findLeaseByPaymentReference } from '@/features/payments'
import { TransactionResult } from '@/features/payments/components/TransactionResult'

export const metadata: Metadata = {
  title: 'Paiement test confirmé · AryTrano',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{
  reference?: string
  order_reference?: string
}>

/**
 * GoalPay TEST mode — success redirect.
 *
 * Mirror of `/transaction/done` for the test-mode dashboard URLs
 * (`http://localhost:3000/test/success`). Same logic : lookup
 * payment by `reference`, gate the leaseId-keyed CTA behind the
 * auth match, never mutate state from the URL.
 *
 * The dashboard test config in GoalPay lets us point at localhost
 * for redirects (browser follows them, no DNS issue). For the
 * webhook, use ngrok — see runbooks/payments-goalpay.md §4.
 */
export default async function TestSuccessPage({
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
      status="done"
      leaseHref={leaseHref}
      showLeaseLink={showLeaseLink}
    />
  )
}
