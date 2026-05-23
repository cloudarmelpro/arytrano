import 'server-only'
import { prisma } from '@/lib/db'
import { rateLimiters } from '@/lib/rate-limit'
import { errors } from '@/lib/api/errors'
import { whatsappAlertSchema, type WhatsAppAlertInput } from '../schemas/whatsapp-alert'
import { generateUnsubscribeToken } from './generate-unsubscribe-token'

export type SubscribeWhatsAppAlertResult = {
  alreadySubscribed: boolean
}

/**
 * Subscribe a Madagascar phone number to the WhatsApp alert list.
 *
 * Anonymous — caller is responsible for passing `ipHash` + `locale`
 * resolved from request headers.
 *
 * SUBSCRIPTION POLICY (v1): one row per phone number. Re-submitting
 * with a different `quartierSlug` REPLACES the previous filter
 * destructively — matches the schema's `phoneE164 @unique` constraint.
 * If we ever want multi-quartier subscriptions per phone, change to
 * `@@unique([phoneE164, quartierSlug])` and migrate existing rows.
 *
 * `alreadySubscribed` lets the caller surface the right UX message
 * ("you're already on the list" vs "welcome"). A pure upsert would
 * atomically do both but couldn't differentiate the two outcomes.
 */
export async function subscribeWhatsAppAlert(input: {
  data: WhatsAppAlertInput
  ipHash: string | null
  locale: 'fr-MG' | 'mg'
}): Promise<SubscribeWhatsAppAlertResult> {
  const limit = await rateLimiters.whatsappAlert(input.ipHash ?? `noip:wa`)
  if (!limit.success) throw errors.rateLimited('Trop de tentatives')

  const existing = await prisma.whatsAppAlert.findUnique({
    where: { phoneE164: input.data.phone },
    select: { id: true, unsubscribedAt: true, unsubscribeToken: true },
  })

  if (existing) {
    // Re-subscribe: clear the unsubscribedAt flag and refresh settings.
    // Token stays stable so any old broadcast still has a working
    // unsubscribe link. Only generate a new token for legacy rows
    // (pre T-045 migration where token was nullable).
    await prisma.whatsAppAlert.update({
      where: { id: existing.id },
      data: {
        locale: input.locale,
        quartierSlug: input.data.quartierSlug ?? null,
        unsubscribedAt: null,
        ...(existing.unsubscribeToken
          ? {}
          : { unsubscribeToken: generateUnsubscribeToken() }),
      },
    })
    return { alreadySubscribed: true }
  }

  await prisma.whatsAppAlert.create({
    data: {
      phoneE164: input.data.phone,
      locale: input.locale,
      quartierSlug: input.data.quartierSlug ?? null,
      ipHash: input.ipHash,
      unsubscribeToken: generateUnsubscribeToken(),
    },
  })
  return { alreadySubscribed: false }
}

// Re-export the schema so callers (action + API handler) have a
// single import path.
export { whatsappAlertSchema }
