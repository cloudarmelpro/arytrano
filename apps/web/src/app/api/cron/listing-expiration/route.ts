import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { processListingExpirations } from '@/features/listings/services/process-listing-expirations'

// Audit SEC-C2 (2026-05-29) — timing-safe Bearer compare. The previous
// `!==` byte-by-byte equality leaked the CRON_SECRET via response-time
// differential. Pattern mirrors /api/cron/reconcile-payments.
function bearerEquals(received: string | null, expected: string): boolean {
  if (!received) return false
  const want = `Bearer ${expected}`
  if (received.length !== want.length) return false
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(want))
}

/**
 * Daily cron — sends 7-day warning emails + auto-expires past-due
 * listings (T-049). Mirrors the protection + observability shape
 * of `/api/cron/prompt-review`.
 *
 * Scheduling (production) : systemd timer in
 * `runbooks/contabo-deployment.md §10b`. Run shortly after the
 * review-prompt cron so daily transactional volume is spread.
 *
 * Dev trigger :
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     http://localhost:3000/api/cron/listing-expiration
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  // Audit SEC-C2 — rate-limit BEFORE secret check so brute-force probes
  // burn through the bucket without leaking 401-vs-503 timing signals.
  const { ipHash } = extractRequestInfo(request.headers)
  const rl = await rateLimiters.cronAccess(ipHash)
  if (!rl.success) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  if (!env.CRON_SECRET) {
    // Sec audit (2026-06-08) — mirror the push-receipts pattern:
    // missing CRON_SECRET silently disables the job. Surface the
    // misconfig in Sentry instead of letting it rot for weeks.
    Sentry.captureMessage('Cron disabled (CRON_SECRET missing)', {
      level: 'error',
      tags: { cron: 'listing-expiration', issue: 'disabled' },
    })
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (!bearerEquals(request.headers.get('authorization'), env.CRON_SECRET)) {
    // Wrong secret = scheduler config drifted. The cron has effectively
    // stopped running; warning-level Sentry surfaces it.
    Sentry.captureMessage('Cron auth failed (bad bearer)', {
      level: 'warning',
      tags: { cron: 'listing-expiration', auth: 'failed' },
    })
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await processListingExpirations()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { cron: 'listing-expiration' },
    })
    return NextResponse.json(
      { ok: false, error: 'cron_failed' },
      { status: 200 },
    )
  }
}
