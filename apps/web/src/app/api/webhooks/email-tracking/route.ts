import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { env } from '@/lib/env'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const trackingSchema = z.object({
  messageId: z.string(),
  email: z.string().email(),
  eventType: z.enum([
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'complained',
    'unsubscribed',
  ]),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * COM-10 — provider-agnostic email tracking webhook. Shape kept
 * narrow so an ESP swap is a template change rather than a schema
 * migration. Auth via the shared secret used by the COM-12 bounce
 * webhook so we don't multiply keys.
 */
export async function POST(req: Request) {
  if (!env.EMAIL_BOUNCE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }
  const presented = (req.headers.get('authorization') ?? '').replace(
    /^Bearer\s+/i,
    '',
  )
  const expected = env.EMAIL_BOUNCE_WEBHOOK_SECRET
  const ok =
    presented.length === expected.length &&
    timingSafeEqual(Buffer.from(presented), Buffer.from(expected))
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }
  const parsed = trackingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  try {
    await prisma.emailEvent.create({
      data: {
        messageId: parsed.data.messageId,
        email: parsed.data.email.toLowerCase().trim(),
        eventType: parsed.data.eventType,
        metadata: (parsed.data.metadata as object | undefined) ?? undefined,
      },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    Sentry.captureException(err, { tags: { kind: 'email-tracking' } })
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
