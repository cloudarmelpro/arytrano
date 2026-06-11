import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { sweepStaleClaimedLeads } from '@/features/leads/server'

function bearerEquals(received: string | null, expected: string): boolean {
  if (!received) return false
  const want = `Bearer ${expected}`
  if (received.length !== want.length) return false
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(want))
}

/**
 * E-T28 T-RES-10 — every hour. Auto-reverts CLAIMED leads whose SLA
 * deadline has passed without activity. Operator goes on vacation
 * silently → cron reclaims the slot back to NEW for someone else.
 *
 * Scheduling : hourly systemd timer or Vercel Cron.
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
      tags: { cron: 'sweep-stale-claimed-leads', issue: 'disabled' },
    })
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (!bearerEquals(request.headers.get('authorization'), env.CRON_SECRET)) {
    Sentry.captureMessage('Cron auth failed (bad bearer)', {
      level: 'warning',
      tags: { cron: 'sweep-stale-claimed-leads', auth: 'failed' },
    })
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await sweepStaleClaimedLeads()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    Sentry.captureException(err, { tags: { cron: 'sweep-stale-claimed-leads' } })
    return NextResponse.json(
      { ok: false, error: 'cron_failed' },
      { status: 200 },
    )
  }
}
