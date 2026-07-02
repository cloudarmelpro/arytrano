import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { sendMonthlyNewsletter } from '@/features/newsletter/services/send-monthly-newsletter'

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
  if (!rl.success) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  if (!env.CRON_SECRET) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  if (!bearerEquals(request.headers.get('authorization'), env.CRON_SECRET)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  try {
    const result = await sendMonthlyNewsletter()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    Sentry.captureException(err, { tags: { cron: 'monthly-newsletter' } })
    return NextResponse.json({ ok: false, error: 'cron_failed' }, { status: 200 })
  }
}
