import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { sweepUnclaimedLeads } from '@/features/leads/server'

// SEC-C2 audit — timing-safe Bearer compare. Mirror of push-receipts.
function bearerEquals(received: string | null, expected: string): boolean {
  if (!received) return false
  const want = `Bearer ${expected}`
  if (received.length !== want.length) return false
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(want))
}

/**
 * E-T28 T-RES-10 — every 15 minutes. Escalates NEW leads that have
 * been sitting in the queue for more than 4h without being claimed.
 *
 * Scheduling :
 *  - Production : systemd timer (or Vercel Cron) every 15 min.
 *  - Dev :
 *    curl -H "Authorization: Bearer $CRON_SECRET" \
 *      http://localhost:3000/api/cron/sweep-unclaimed-leads
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { ipHash } = extractRequestInfo(request.headers)
  const rl = await rateLimiters.cronAccess(ipHash)
  if (!rl.success) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  if (!env.CRON_SECRET) {
    Sentry.captureMessage('Cron disabled (CRON_SECRET missing)', {
      level: 'error',
      tags: { cron: 'sweep-unclaimed-leads', issue: 'disabled' },
    })
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (!bearerEquals(request.headers.get('authorization'), env.CRON_SECRET)) {
    Sentry.captureMessage('Cron auth failed (bad bearer)', {
      level: 'warning',
      tags: { cron: 'sweep-unclaimed-leads', auth: 'failed' },
    })
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await sweepUnclaimedLeads()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    Sentry.captureException(err, { tags: { cron: 'sweep-unclaimed-leads' } })
    return NextResponse.json(
      { ok: false, error: 'cron_failed' },
      { status: 200 },
    )
  }
}
