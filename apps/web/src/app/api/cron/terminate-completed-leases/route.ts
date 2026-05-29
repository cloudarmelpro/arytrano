import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { terminateCompletedLeases } from '@/features/leases/services/terminate-completed-leases'

/**
 * S2-24 — cron auto-TERMINATE leases whose computed end date has
 * passed. Companion to /api/cron/expire-pending-leases.
 *
 * Recommended frequency : daily 04:30 UTC.
 *
 * Manual trigger :
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     http://localhost:3000/api/cron/terminate-completed-leases
 *
 * Same auth + rate-limit shape as the other cron routes for
 * operational consistency.
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
    const result = await terminateCompletedLeases()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { cron: 'terminate-completed-leases' },
    })
    return NextResponse.json(
      { ok: false, error: 'cron_failed' },
      { status: 500 },
    )
  }
}
