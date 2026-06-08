import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { processPushReceipts } from '@/lib/push/process-receipts'

// Audit SEC-C2 (2026-05-29) — timing-safe Bearer compare. Mirror of
// the pattern in /api/cron/reconcile-payments.
function bearerEquals(received: string | null, expected: string): boolean {
  if (!received) return false
  const want = `Bearer ${expected}`
  if (received.length !== want.length) return false
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(want))
}

/**
 * Every ~30 min — poll Expo Push API for receipts of recent sends.
 *
 * Cleans up `User.expoPushToken` for users whose receipt is
 * `DeviceNotRegistered` (uninstall / token rotation), so we stop
 * dispatching to dead tokens.
 *
 * Scheduling (production) : systemd timer in
 * `runbooks/contabo-deployment.md` — every 30 minutes is the sweet
 * spot. Receipts are available after ~15-30 min and Expo keeps them
 * for 24h, so even if a run is missed we recover on the next.
 *
 * Dev trigger :
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     http://localhost:3000/api/cron/push-receipts
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  // SEC-C2 — rate-limit BEFORE secret check.
  const { ipHash } = extractRequestInfo(request.headers)
  const rl = await rateLimiters.cronAccess(ipHash)
  if (!rl.success) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  if (!env.CRON_SECRET) {
    // Sec P1-4 : emit a Sentry breadcrumb so missing CRON_SECRET in
    // prod surfaces in the dashboard instead of silently disabling
    // the cron for weeks.
    Sentry.captureMessage('Cron disabled (CRON_SECRET missing)', {
      level: 'error',
      tags: { cron: 'push-receipts', issue: 'disabled' },
    })
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (!bearerEquals(request.headers.get('authorization'), env.CRON_SECRET)) {
    // Wrong secret = the scheduler config drifted. Surface in Sentry —
    // the job has effectively stopped running.
    Sentry.captureMessage('Cron auth failed (bad bearer)', {
      level: 'warning',
      tags: { cron: 'push-receipts', auth: 'failed' },
    })
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await processPushReceipts()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { cron: 'push-receipts' },
    })
    return NextResponse.json(
      { ok: false, error: 'cron_failed' },
      { status: 200 },
    )
  }
}
