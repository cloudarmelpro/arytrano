import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { reconcileStuckLeaseActivations } from '@/features/leases/services/reconcile-stuck-lease-activations'

/**
 * S2-18 — cron sweep for the "payment confirmed but lease never
 * activated" zombie case. See the service docstring for the failure
 * mode this defends against.
 *
 * Recommended frequency : hourly. The reconcile-stuck-payments cron
 * already runs hourly for an adjacent failure mode (Payment stuck
 * in INITIATED) so co-scheduling is convenient.
 *
 * Manual trigger :
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     http://localhost:3000/api/cron/reconcile-stuck-lease-activations
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
    const result = await reconcileStuckLeaseActivations()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { cron: 'reconcile-stuck-lease-activations' },
    })
    return NextResponse.json(
      { ok: false, error: 'cron_failed' },
      { status: 500 },
    )
  }
}
