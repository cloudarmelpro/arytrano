'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { whatsappAlertSchema } from '../schemas/whatsapp-alert'

type ActionResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; error: 'invalid' | 'rate_limit' | 'unavailable' }

/**
 * Subscribe a Madagascar phone number to the WhatsApp alert list.
 *
 * Anonymous — no auth required. Phone is normalized to E.164
 * (+2613XXXXXXXX) server-side; the form sends whatever the user
 * typed. Upserts on phoneE164 so re-submitting the same number is a
 * no-op (touches updatedAt) — we surface that via `alreadySubscribed`
 * so the UI can say "you're already on the list" instead of acting
 * like a fresh signup.
 *
 * v1: storage only. Outbound WhatsApp broadcasts are still manual via
 * the admin tooling; we don't want to pay for WhatsApp Business API
 * before validating demand.
 */
export async function subscribeWhatsAppAlertAction(input: {
  phone: unknown
  quartierSlug?: unknown
}): Promise<ActionResult> {
  const parsed = whatsappAlertSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }

  const h = await headers()
  const { ipHash } = extractRequestInfo(h)
  const locale = h.get('x-locale') === 'mg' ? 'mg' : 'fr-MG'

  const limit = await rateLimiters.whatsappAlert(ipHash)
  if (!limit.success) return { ok: false, error: 'rate_limit' }

  try {
    // findFirst then create/update so we know whether the row was new
    // (different message in the UI). A pure `upsert` would atomically
    // do both but couldn't differentiate the two outcomes.
    const existing = await prisma.whatsAppAlert.findUnique({
      where: { phoneE164: parsed.data.phone },
      select: { id: true },
    })

    if (existing) {
      await prisma.whatsAppAlert.update({
        where: { id: existing.id },
        data: {
          locale,
          quartierSlug: parsed.data.quartierSlug ?? null,
        },
      })
      return { ok: true, alreadySubscribed: true }
    }

    await prisma.whatsAppAlert.create({
      data: {
        phoneE164: parsed.data.phone,
        locale,
        quartierSlug: parsed.data.quartierSlug ?? null,
        ipHash,
      },
    })
    return { ok: true, alreadySubscribed: false }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}
