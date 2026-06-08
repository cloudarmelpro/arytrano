import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { sendReviewPrompts } from '@/features/reviews/services/send-review-prompts'

// Audit SEC-C2 (2026-05-29) — timing-safe Bearer compare.
function bearerEquals(received: string | null, expected: string): boolean {
  if (!received) return false
  const want = `Bearer ${expected}`
  if (received.length !== want.length) return false
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(want))
}

/**
 * Daily cron — invites students to leave a review 14 days after they
 * contacted a listing owner (T-050).
 *
 * Auth : Bearer secret in the `Authorization` header, matched against
 * `env.CRON_SECRET`. Without it any visitor could trigger the job.
 *
 * Scheduling :
 *   - Production : Vercel Cron config or systemd timer hits this URL
 *     once a day around 09:00 UTC (12:00 MG, late morning is the best
 *     open-rate window per local research).
 *   - Dev : trigger manually with
 *       curl -H "Authorization: Bearer $CRON_SECRET" \
 *         http://localhost:3000/api/cron/prompt-review
 *
 * Failure semantics : we capture per-batch errors in Sentry but return
 * 200 OK so the scheduler doesn't keep retrying a broken state. Any
 * partial failures inside the batch (single email bounces) are
 * already swallowed by sendTransactionalEmail.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  // 1. Rate-limit BEFORE secret check (SEC-C2 pattern).
  const { ipHash } = extractRequestInfo(request.headers)
  const rl = await rateLimiters.cronAccess(ipHash)
  if (!rl.success) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  // 2. Auth — Bearer secret, timing-safe compare.
  if (
    !env.CRON_SECRET ||
    !bearerEquals(request.headers.get('authorization'), env.CRON_SECRET)
  ) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  // 2. Run the orchestrator
  try {
    const result = await sendReviewPrompts(100)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { cron: 'prompt-review' },
    })
    return NextResponse.json(
      { ok: false, error: 'cron_failed' },
      { status: 200 }, // 200 to stop scheduler retry; alert is in Sentry
    )
  }
}
