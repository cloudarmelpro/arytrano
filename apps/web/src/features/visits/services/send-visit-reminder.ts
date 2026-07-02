import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { sendSms, SmsSendError } from '@/lib/sms'

/**
 * COM-05 — send an SMS reminder to a confirmed visit. The scheduling
 * cron picks up visits from the future OWN-11 model and calls this
 * helper 24h and 2h before the appointment.
 *
 * Kept intentionally minimal — no template engine, no i18n branching
 * yet (Twilio Malagasy support is patchy). The SMS provider abstraction
 * is already there so switching to a Malagasy carrier later is a
 * config change.
 */
export type VisitReminderInput = {
  tenantPhoneE164: string
  listingTitle: string
  neighborhoodName: string
  when: Date
  ownerName: string | null
}

export async function sendVisitReminderSms(
  input: VisitReminderInput,
): Promise<{ sent: boolean }> {
  const timeStr = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(input.when)

  const owner = input.ownerName?.trim() || 'le propriétaire'
  const body = [
    `Rappel visite AryTrano :`,
    `${input.listingTitle} — ${input.neighborhoodName}`,
    `${timeStr}`,
    `Contact : ${owner}`,
    ``,
    `Annuler / reporter : arytrano.com/dashboard/visits`,
  ].join('\n')

  try {
    await sendSms({ to: input.tenantPhoneE164, body })
    return { sent: true }
  } catch (err) {
    if (err instanceof SmsSendError) {
      Sentry.captureException(err, {
        tags: { feature: 'visit-reminder', provider: err.provider },
      })
    } else {
      Sentry.captureException(err, {
        tags: { feature: 'visit-reminder' },
      })
    }
    return { sent: false }
  }
}
