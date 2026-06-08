import type { Metadata } from 'next'
import { resolveLeaseHrefForReturn } from '@/features/payments/server'
import { TransactionResult } from '@/features/payments'

export const metadata: Metadata = {
  title: 'Paiement test confirmé · AryTrano',
  description: 'Mode TEST GoalPay — simulation de paiement confirmé.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Paiement test confirmé · AryTrano',
    description: 'Mode TEST GoalPay — simulation de paiement confirmé.',
    images: ['/images/arytrano.webp'],
  },
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
 * webhook, use ngrok — see runbooks/payments-goalpay.md §2.bis.
 */
export default async function TestSuccessPage({
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
