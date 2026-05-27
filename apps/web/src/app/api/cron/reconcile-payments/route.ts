import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { reconcileStuckPayments } from '@/features/payments/server'

/**
 * Cron — Payment reconciliation (E-T20 minimal v1).
 *
 * Mark Payments stuck > 60 min in INITIATED / PENDING as EXPIRED so the
 * dashboard isn't polluted by orphaned rows from abandoned checkouts.
 *
 * Recommended frequency: hourly. systemd timer or Vercel cron.
 *
 * Manual trigger :
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     http://localhost:3000/api/cron/reconcile-payments
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Constant-time bearer comparison.
 * - Returns false immediately on length mismatch (avoids `timingSafeEqual` throw).
 * - Uses `crypto.timingSafeEqual` to avoid byte-by-byte short-circuit leaks.
 */
function bearerEquals(received: string | null, expected: string): boolean {
  if (!received) return false
  const want = `Bearer ${expected}`
  if (received.length !== want.length) return false
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(want))
}

export async function GET(request: Request) {
  // SEC-H3 audit fix — rate-limit BEFORE secret check, so brute-force
  // probes burn through the bucket without any 401/503 signal that
  // would tell the attacker the endpoint exists.
  const { ipHash } = extractRequestInfo(request.headers)
  const rl = await rateLimiters.cronAccess(ipHash)
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 },
    )
  }

  // SEC-H3 audit fix — fail-CLOSED with 401 (NOT 503) when CRON_SECRET
  // is unset, so an unauthenticated probe cannot distinguish
  // "endpoint exists but misconfigured" from "wrong secret".
  // SEC-H1 audit fix — constant-time compare to prevent byte-by-byte
  // timing leaks of the secret.
  if (
    !env.CRON_SECRET ||
    !bearerEquals(request.headers.get('authorization'), env.CRON_SECRET)
  ) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 },
    )
  }

  try {
    const result = await reconcileStuckPayments()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { cron: 'reconcile-payments' },
    })
    // M6 audit fix — return 500 so external monitors (UptimeKuma,
    // Vercel cron alerts) trip on a stuck cron instead of silently
    // accepting an OK 200 with an error payload.
    return NextResponse.json(
      { ok: false, error: 'cron_failed' },
      { status: 500 },
    )
  }
}
