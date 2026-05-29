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
 * "Nouveau contact" email (T-047, revised for concierge model 2026-05-27).
 * Fired by `record-contact-click` after a ContactEvent insert.
 *
 * Tone : reassuring — the owner doesn't have to do anything. AryTrano
 * received the inquiry on their behalf and will relay it through the
 * normal team workflow. Owner consults their dashboard stats if they
 * want to see the volume.
 *
 * Anti-spam : rate-limited 10/h per (userId, eventType) by the
 * transactional send wrapper.
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
      subject: `Nahazo fanontaniana ho an'ny ${data.listingTitle}`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `Misy olona naneho fahalianana amin'ny <strong>${safeTitle}</strong> tamin'ny alalan'ny ${channelMg}.<br/><br/>` +
          `Ny ekipan'AryTrano no nahazo ny fanontaniana — izahay no manao fifandraisana aminao raha mety. Tsy mila manao na inona na inona ianao izao.<br/><br/>` +
          `Jereo ny stats-anao mba hahafantarana ny ankamaroan'ny fifandraisana ny filazana-nao.`,
        primaryCta: {
          label: 'Hijery ny stats',
          href: data.statsUrl,
        },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body:
          `Fanontaniana vaovao amin'ny ${data.listingTitle} (${channelMg}). Ny ekipan'AryTrano no nahazo azy ary hifandray aminao raha mety.\n\n` +
          `Stats : ${data.statsUrl}`,
        cta: data.statsUrl,
      }),
    }
  }

  const channelFr =
    data.channel === 'WHATSAPP' ? 'WhatsApp' : 'appel téléphonique'
  return {
    subject: `Nouvelle demande pour ${data.listingTitle}`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `Quelqu'un vient de marquer son intérêt pour <strong>${safeTitle}</strong> via ${channelFr}.<br/><br/>` +
        `L'équipe AryTrano a reçu la demande — on revient vers toi si le contact aboutit. Tu n'as rien à faire pour l'instant.<br/><br/>` +
        `Consulte tes statistiques pour suivre l'activité de ton annonce.`,
      primaryCta: {
        label: 'Voir les stats',
        href: data.statsUrl,
      },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body:
        `Nouvelle demande sur ${data.listingTitle} (${channelFr}). L'équipe AryTrano a reçu le message et revient vers toi si le contact aboutit.\n\n` +
        `Stats : ${data.statsUrl}`,
      cta: data.statsUrl,
    }),
  }
}
