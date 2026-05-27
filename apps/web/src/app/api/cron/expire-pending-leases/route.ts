import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { expirePendingLeases } from '@/features/leases/services/expire-pending-leases'

/**
 * Cron — auto-REFUSE leases stuck in PENDING_TENANT past their
 * acceptance window (default 14 days). Companion to the owner-side
 * manual cancel — covers the case where the owner doesn't notice
 * the stuck lease themselves.
 *
 * Recommended frequency : daily (systemd timer or Vercel cron).
 *
 * Manual trigger :
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     http://localhost:3000/api/cron/expire-pending-leases
 *
 * Mirror of /api/cron/reconcile-payments : same auth, same rate-limit
 * shape, same fail-modes.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function bearerEquals(received: string | null, expected: string): boolean {
  if (!received) return false
  const want = `Bearer ${expected}`
  if (received.length !== want.length) return false
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(want))
}

export async function GET(request: Request) {
  // Rate-limit BEFORE secret check (same SEC-H3 pattern as
  // reconcile-payments) — brute-force probes burn the bucket without
  // any 401/503 signal leaking that the endpoint exists.
  const { ipHash } = extractRequestInfo(request.headers)
  const rl = await rateLimiters.cronAccess(ipHash)
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 },
    )
  }

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
    const result = await expirePendingLeases()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { cron: 'expire-pending-leases' },
    })
    return NextResponse.json(
      { ok: false, error: 'cron_failed' },
      { status: 500 },
    )
  }
}
