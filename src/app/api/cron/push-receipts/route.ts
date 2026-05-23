import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { processPushReceipts } from '@/lib/push/process-receipts'

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
  if (!env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'cron_disabled' }, { status: 503 })
  }
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
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
