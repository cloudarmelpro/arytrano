import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { env } from '@/lib/env'
import { recordEmailBounce } from '@/features/email-bounce/server'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * COM-12 — generic bounce webhook ingress. Provider-agnostic schema:
 * the request body must contain `email` and `kind` ('hard' | 'soft').
 * Most ESPs (Postmark, SES SNS, Brevo) let you template the outgoing
 * payload, so we stay narrow on shape instead of supporting one
 * vendor envelope.
 *
 * Auth: shared secret in `Authorization: Bearer <env>` header — same
 * pattern as the cron routes. Timing-safe compare.
 *
 * Response surface mirrors the GoalPay webhook: 200 on ingest (incl.
 * soft / no_match), 401 on auth failure, 503 when the secret env is
 * missing (so a misconfigured provider gets a clear signal).
 */
const BounceBodySchema = z.object({
  email: z.string().email(),
  kind: z.enum(['hard', 'soft']),
})

export async function POST(req: Request) {
  if (!env.EMAIL_BOUNCE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'webhook not configured' },
      { status: 503 },
    )
  }

  const auth = req.headers.get('authorization') ?? ''
  const presented = auth.replace(/^Bearer\s+/i, '')
  const expected = env.EMAIL_BOUNCE_WEBHOOK_SECRET
  const ok =
    presented.length === expected.length &&
    timingSafeEqual(Buffer.from(presented), Buffer.from(expected))
  if (!ok) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Rate-limit by IP — even authenticated providers shouldn't spam,
  // and a leaked secret needs a backstop.
  const { ipHash } = extractRequestInfo(req.headers)
  const rl = await rateLimiters.webhookIngress(ipHash)
  if (!rl.success) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let body
  try {
    body = BounceBodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  try {
    const outcome = await recordEmailBounce(body)
    if (outcome.kind === 'recorded' && outcome.nowDisabled) {
      Sentry.captureMessage('user email disabled (bounce threshold)', {
        level: 'info',
        tags: { kind: 'email-disabled' },
        extra: { userId: outcome.userId },
      })
    }
    return NextResponse.json({ ok: true, outcome: outcome.kind }, { status: 200 })
  } catch (err) {
    Sentry.captureException(err, { tags: { kind: 'email-bounce' } })
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
