import 'server-only'
import { env } from '@/lib/env'
import { fromPrismaLocale, type Locale } from '@/lib/i18n/config'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildContactReceivedEmail } from '@/lib/email/templates/contact-received'

type Channel = 'WHATSAPP' | 'PHONE'

export type NotifyOwnerContactInput = {
  ownerId: string
  ownerEmail: string
  ownerName: string | null
  ownerLocale: 'FR_MG' | 'MG'
  /** Owner toggle from User.contactNotificationsEnabled. */
  contactNotificationsEnabled: boolean
  listingId: string
  listingTitle: string
  channel: Channel
}

/**
 * Fire-and-forget owner notification on a fresh ContactEvent (T-047).
 *
 * Wrapped so the caller (`record-contact-click`) can fail-soft : the
 * student's contact reveal MUST succeed even if our SMTP relay is
 * down. We never throw out of this function — internal errors are
 * swallowed (the underlying `sendTransactionalEmail` already
 * fail-softs on rate-limit + SMTP errors).
 *
 * Skip conditions, in order of cheapness :
 *   1. Owner opted out via the dashboard switch
 *   2. Owner has no email on file (account was anonymised)
 *   3. `sendTransactionalEmail` rate-limit (10/h per userId+event)
 */
export async function notifyOwnerContact(
  input: NotifyOwnerContactInput,
): Promise<void> {
  if (!input.contactNotificationsEnabled) return
  if (!input.ownerEmail) return

  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const statsUrl = `${baseUrl}/dashboard/listings/${input.listingId}/stats`

  const localeKey: Locale = fromPrismaLocale(input.ownerLocale)
  const email = buildContactReceivedEmail(localeKey, {
    recipientName: input.ownerName ?? 'Propriétaire',
    listingTitle: input.listingTitle,
    channel: input.channel,
    statsUrl,
  })

  try {
    await sendTransactionalEmail({
      recipientId: input.ownerId,
      recipientEmail: input.ownerEmail,
      eventType: 'contact-received',
      ...email,
    })
  } catch {
    // Defensive — sendTransactionalEmail already swallows its own
    // errors, but if a future change throws we still want the
    // contact reveal to succeed for the student.
  }
}
