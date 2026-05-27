import type { Metadata } from 'next'
import { auth } from '@/features/auth'
import { findLeaseByPaymentReference } from '@/features/payments'
import { TransactionResult } from '@/features/payments/components/TransactionResult'

export const metadata: Metadata = {
  title: 'Paiement confirmé · AryTrano',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{
  reference?: string
  order_reference?: string
}>

/**
 * GoalPay post-checkout redirect — success branch.
 *
 * URL : configured in the GoalPay merchant dashboard as
 *   https://arytrano.com/transaction/done?reference=lease_XXX&order_reference=REF_YYY
 *
 * IMPORTANT — this page is the UI beacon, NOT the source of truth.
 * The Lease state machine is driven by the GoalPay webhook (S2S POST
 * to /api/webhooks/goalpay + alias /webhook-gpay). A user landing
 * here after a successful payment SHOULD see the lease at
 * PENDING_TENANT (the webhook usually fires before the redirect
 * resolves). If they land here while the webhook is still in flight,
 * they'll see the lease at DRAFT briefly — refresh fixes it.
 *
 * We never mutate state based on the URL : anyone with the redirect
 * link could replay it. The webhook's HMAC verification is the only
 * trusted source.
 */
export default async function TransactionDonePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const session = await auth()
  const reference = typeof sp.reference === 'string' ? sp.reference : null

  // Look up the lease so the CTA points at the right detail page.
  // We don't trust the URL ; auth check + ownership match guards
  // the leaseId disclosure.
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
