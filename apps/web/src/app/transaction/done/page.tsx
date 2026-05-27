import type { Metadata } from 'next'
import { resolveLeaseHrefForReturn } from '@/features/payments/server'
import { TransactionResult } from '@/features/payments'

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
 * trusted source. Ownership gating happens inside resolveLeaseHrefForReturn.
 */
export default async function TransactionDonePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const reference = typeof sp.reference === 'string' ? sp.reference : null
  const { leaseHref, showLeaseLink } = await resolveLeaseHrefForReturn(reference)

  return (
    <TransactionResult
      status="done"
      leaseHref={leaseHref}
      showLeaseLink={showLeaseLink}
    />
  )
}
