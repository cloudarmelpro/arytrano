import { NextResponse } from 'next/server'
import { goalPayProvider, recordWebhookEvent } from '@/features/payments'
import { applyLeasePaymentSideEffect } from '@/features/leases'

// Webhooks must run on the Node.js runtime — we rely on `node:crypto`
// (HMAC-SHA256 with timing-safe compare) and Prisma. The Edge runtime
// is not appropriate here.
export const runtime = 'nodejs'

// Don't cache anything on a webhook. Every request is a unique event.
export const dynamic = 'force-dynamic'

/**
 * GoalPay webhook ingress.
 *
 * Per https://goalpay.pro/docs/api/integrations the payload is JSON
 * with HMAC-SHA256 signature in `x-gpay-signature` header (hex digest
 * over the raw body, keyed by `GOALPAY_WEBHOOK_SECRET`).
 *
 * Response semantics :
 *   - 401 invalid / missing signature                → GoalPay should NOT retry (we're refusing)
 *   - 400 malformed body                             → GoalPay should NOT retry (bad shape, won't fix on replay)
 *   - 422 amount/providerTxId mismatch with our row  → log + 422 (we suspect tampering)
 *   - 200 OK on apply, noop, or unknown_reference    → GoalPay stops retrying
 *
 * Important : we return 200 for `unknown_reference` because a future
 * webhook for a known reference might arrive after a delay, and we
 * don't want GoalPay to keep retrying for a row that doesn't exist
 * (likely a stale dev event hitting prod, or a race we accept).
 *
 * Side-effects beyond the Payment row are handled by downstream
 * services hooked off the `applied` outcome — see record-webhook-event.
 */
/**
 * Healthcheck probe — GoalPay's CLI / dashboard issues a GET when you
 * register or verify the webhook URL. We answer 200 OK with a stable
 * identifier so their verification passes without exposing anything
 * about the endpoint's auth surface. No side effects, no DB hit.
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, endpoint: 'goalpay-webhook' },
    { status: 200 },
  )
}

export async function POST(request: Request) {
  // Read the raw body BEFORE any parsing — HMAC must be computed over
  // the exact bytes received. Calling `request.json()` first would
  // re-serialize and invalidate the signature.
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json(
      { error: 'invalid_body' },
      { status: 400 },
    )
  }

  const signature = request.headers.get('x-gpay-signature')

  if (!goalPayProvider.verifyWebhookSignature(rawBody, signature)) {
    // Don't leak why it failed (missing header vs mismatch) — both
    // surface as 401 to avoid hinting at the verification mechanism.
    return NextResponse.json(
      { error: 'invalid_signature' },
      { status: 401 },
    )
  }

  let event
  try {
    event = goalPayProvider.parseWebhook(rawBody)
  } catch {
    return NextResponse.json(
      { error: 'invalid_payload' },
      { status: 400 },
    )
  }

  const outcome = await recordWebhookEvent(event)

  // Dispatch downstream feature side-effects when the Payment status
  // ACTUALLY changed (the `applied` path). Idempotent replays (`noop`)
  // already handled their side-effect on the first call; running it
  // again would log spurious "already_pending" outcomes.
  if (outcome.kind === 'applied' && outcome.purpose === 'LEASE_SUCCESS_FEE') {
    await applyLeasePaymentSideEffect(outcome.paymentId, outcome.newStatus)
  }

  switch (outcome.kind) {
    case 'mismatch':
      // We could 200 to stop retries, but 422 surfaces the divergence
      // in GoalPay's dashboard so a human can investigate. Either is
      // defensible — picking 422 for visibility during early prod.
      return NextResponse.json(
        { error: 'mismatch', reason: outcome.reason },
        { status: 422 },
      )
    case 'applied':
    case 'noop':
    case 'unknown_reference':
      return NextResponse.json({ ok: true }, { status: 200 })
  }
}
