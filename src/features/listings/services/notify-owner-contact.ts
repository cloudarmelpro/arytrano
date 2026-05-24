import 'server-only'
import { env } from '@/lib/env'
import { fromPrismaLocale, type Locale } from '@/lib/i18n/config'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildContactReceivedEmail } from '@/lib/email/templates/contact-received'
import { sendPush } from '@/lib/push/send-push'
import { recordTickets } from '@/lib/push/receipts'

type Channel = 'WHATSAPP' | 'PHONE'

export type NotifyOwnerContactInput = {
  ownerId: string
  ownerEmail: string
  ownerName: string | null
  ownerLocale: 'FR_MG' | 'MG'
  /** Owner toggle from User.contactNotificationsEnabled. */
  contactNotificationsEnabled: boolean
  /** Mobile push token, null when owner hasn't installed the app. */
  ownerPushToken: string | null
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

  // Mobile push, in parallel to the email. Owner sees both — they
  // pick whichever shows up first (push is usually instant; email
  // can lag a minute via Gmail relay). `sendPush` swallows its own
  // errors so a 5xx from Expo's API doesn't break the flow. Tickets
  // returned by Expo are persisted so the receipt-poll cron can
  // clean up `DeviceNotRegistered` tokens later.
  if (input.ownerPushToken) {
    // Security P1-2 : push payload bodies travel through Expo's
    // infrastructure logs AND are visible on the recipient's lock
    // screen. Don't interpolate `listingTitle` — combined with
    // `data.listingId` it would let anyone with screen access (or
    // anyone reading Expo's customer logs) link a contact event to
    // a specific listing. The mobile app reads `data.listingId` and
    // opens the right detail screen so the owner sees the title
    // INSIDE the app, not on the lock screen.
    const pushTitle = localeKey === 'mg' ? 'Antso vaovao' : 'Nouveau contact'
    const pushBody =
      localeKey === 'mg'
        ? "Misy olona te-hifandray aminao momba ny filazanao. Sokafy ny app hijerena."
        : "Quelqu'un veut te contacter à propos de ton annonce. Ouvre l'app pour voir."
    void sendPush([
      {
        to: input.ownerPushToken,
        title: pushTitle,
        body: pushBody,
        sound: 'default',
        data: {
          kind: 'contactReceived',
          listingId: input.listingId,
          channel: input.channel,
        },
      },
    ]).then((result) =>
      recordTickets(
        result.tickets.map((t) => ({ userId: input.ownerId, ticketId: t.ticketId })),
      ),
    )
  }
}
