import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { reconcileStuckPayments } from '@/features/payments'

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

export async function GET(request: Request) {
  if (!env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'cron_disabled' },
      { status: 503 },
    )
  }
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
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
