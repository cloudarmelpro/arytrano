import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { processListingExpirations } from '@/features/listings/services/process-listing-expirations'

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
  if (!env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'cron_disabled' }, { status: 503 })
  }
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
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
