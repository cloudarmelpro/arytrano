import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type ContactReceivedData = {
  recipientName: string
  listingTitle: string
  /** 'WHATSAPP' or 'PHONE' — drives the FR/MG label only, not the link. */
  channel: 'WHATSAPP' | 'PHONE'
  /** Dashboard stats page URL — `/dashboard/listings/<id>/stats`. */
  statsUrl: string
}

/**
 * "Nouveau contact" email (T-047). Fired by `record-contact-click`
 * after a ContactEvent insert when the listing owner has not opted
 * out via the User.contactNotificationsEnabled toggle.
 *
 * Anti-spam : rate-limited 10/h per (userId, eventType) by the
 * transactional send wrapper. A student spamming the contact button
 * doesn't translate to 50 emails — at most 10 within an hour.
 *
 * Privacy : we DO NOT include the student's name or any identifier.
 * The reveal flow is anonymous by design — the owner only sees the
 * student's number once they ARE contacted via WhatsApp.
 */
export function buildContactReceivedEmail(
  locale: Locale,
  data: ContactReceivedData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)

  if (locale === 'mg') {
    const channelMg =
      data.channel === 'WHATSAPP' ? 'WhatsApp' : 'antso telefaonina'
    return {
      subject: `Nahazo fifandraisana vaovao ho an'ny ${data.listingTitle}`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `Misy mpianatra vao avao naneho fahalianana amin'ny <strong>${safeTitle}</strong> tamin'ny alalan'ny ${channelMg}.<br/><br/>` +
          `Andramo miandrandra ny hafatra ao amin'ny WhatsApp-nao, na jereo ny stats-anao mba hahafantarana ny ankamaroan'ny fifandraisana ny annonce-nao.<br/><br/>` +
          `Tsy mila valianao io mailaka io.`,
        primaryCta: {
          label: 'Hijery ny stats',
          href: data.statsUrl,
        },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body:
          `Fifandraisana vaovao amin'ny ${data.listingTitle} (${channelMg}).\n\n` +
          `Stats : ${data.statsUrl}`,
        cta: data.statsUrl,
      }),
    }
  }

  const channelFr =
    data.channel === 'WHATSAPP' ? 'WhatsApp' : 'appel téléphonique'
  return {
    subject: `Nouveau contact pour ${data.listingTitle}`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `Un étudiant vient de marquer son intérêt pour <strong>${safeTitle}</strong> via ${channelFr}.<br/><br/>` +
        `Surveille ton WhatsApp pour le message, ou consulte tes statistiques pour suivre l'activité de ton annonce.<br/><br/>` +
        `Cet email ne demande pas de réponse.`,
      primaryCta: {
        label: 'Voir les stats',
        href: data.statsUrl,
      },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body:
        `Nouveau contact sur ${data.listingTitle} (${channelFr}).\n\n` +
        `Stats : ${data.statsUrl}`,
      cta: data.statsUrl,
    }),
  }
}
