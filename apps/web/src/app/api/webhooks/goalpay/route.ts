import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { goalPayProvider, recordWebhookEvent } from '@/features/payments/server'
import { applyLeasePaymentSideEffect } from '@/features/leases'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'

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
  // SEC-L5 audit fix — minimal response. The previous body advertised
  // which provider was wired (`endpoint: 'goalpay-webhook'`) — useful
  // for an attacker fingerprinting the stack. GoalPay's verifier only
  // checks the 200, not the payload.
  return NextResponse.json({ ok: true }, { status: 200 })
}

export async function POST(request: Request) {
  // Audit H1 fix — rate-limit BEFORE any work, including HMAC verify.
  // The webhook handler is exposed at 3 URLs (canonical + 2 aliases)
  // and an attacker can spam all 3 with bogus bodies. Without a limit
  // each request still runs `request.text()` + HMAC compute + Sentry
  // capture. Fail-CLOSED on null IP so a stripped X-Forwarded-For
  // can't bypass the cap.
  const { ipHash } = extractRequestInfo(request.headers)
  const rl = await rateLimiters.webhookIngress(ipHash)
  if (!rl.success) {
    // 429 with no body — don't hint that this is a rate-limit response
    // (an attacker enumerating endpoints can already see the status).
    return NextResponse.json({ error: 'too_many' }, { status: 429 })
  }

  // SEC-M1 audit fix — bound the buffer BEFORE running HMAC over it.
  // Without this an attacker can POST hundreds of MB of garbage and
  // burn Node memory + CPU before the signature check rejects them.
  // GoalPay's real payloads sit comfortably under 4 KB; 32 KB is a
  // generous ceiling.
  const len = Number(request.headers.get('content-length') ?? 0)
  if (len > 32_768) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 })
  }

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
    // Audit fix — alert on EVERY invalid signature. This is either an
    // attack (someone POSTing forged webhooks) or a rotated secret
    // mismatch between dashboard and env. Both need admin attention.
    // No PII in the tags : only the presence/absence of a sig header.
    Sentry.captureMessage('webhook signature invalid', {
      level: 'warning',
      tags: {
        kind: 'invalid_signature',
        hasHeader: signature ? 'true' : 'false',
      },
    })
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
      // SEC-L2 audit fix — DON'T leak the mismatch reason in the response.
      // HMAC-valid callers are GoalPay (no need for hints) and any
      // future bypass should not gain free reconnaissance on what
      // tripped the check. Reason still goes to Sentry for human triage.
      Sentry.captureMessage('webhook mismatch', {
        level: 'warning',
        tags: { kind: 'mismatch', reason: outcome.reason },
        extra: { paymentId: outcome.paymentId },
      })
      return NextResponse.json({ error: 'mismatch' }, { status: 422 })
    case 'applied':
    case 'noop':
    case 'unknown_reference':
      return NextResponse.json({ ok: true }, { status: 200 })
  }
}
