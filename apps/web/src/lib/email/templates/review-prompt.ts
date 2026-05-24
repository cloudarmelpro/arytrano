import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type ReviewPromptData = {
  recipientName: string
  listingTitle: string
  /** Public URL of the listing detail page where ReviewForm lives inline. */
  listingUrl: string
}

/**
 * "Laisse un avis" email (T-050). Triggered by the daily cron
 * `prompt-review` 14 days after a student initiated a ContactEvent
 * on a listing, IF they haven't already left a review for it.
 *
 * Tone : light, no pressure. Students don't owe us a review, but the
 * prompt does increase response rate. Kept short — the CTA points to
 * the listing detail page where the inline ReviewForm lives.
 */
export function buildReviewPromptEmail(
  locale: Locale,
  data: ReviewPromptData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)

  if (locale === 'mg') {
    return {
      subject: `Ahoana ny ${data.listingTitle} ?`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `Efa 2 herinandro lasa izay no nifandraisanao tamin\'ny tompon\'ny <strong>${safeTitle}</strong>.<br/><br/>` +
          `Nahomby ve ny tetikasa ? Na nahita lozasy ? Na tsia, ny <strong>hevitrao mamela soratra</strong> dia manampy ny mpianatra hafa hisafidy tsara.<br/><br/>` +
          `Tsy maharitra mihoatra ny minitra iray. Misaotra.`,
        primaryCta: { label: 'Hametraka hevitra', href: data.listingUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body:
          `Efa 2 herinandro lasa izay no nifandraisanao tamin\'ny ${data.listingTitle}.\n\n` +
          `Ahoana ny zava-niseho ? Ny hevitrao manampy ny mpianatra hafa.\n` +
          `Mametraka hevitra : ${data.listingUrl}`,
        cta: data.listingUrl,
      }),
    }
  }

  return {
    subject: `Ton avis sur ${data.listingTitle} ?`,
    html: emailHtmlLayout({
      salutation: `Salut ${safeName},`,
      body:
        `Il y a 2 semaines tu as contacté le proprio de <strong>${safeTitle}</strong>.<br/><br/>` +
        `Tu as visité ? Tu loues ? Tu as renoncé ? Quoi qu\'il se soit passé, <strong>ton retour aide les autres étudiants</strong> à choisir sereinement.<br/><br/>` +
        `Ça prend 1 minute. Merci d\'avance.`,
      primaryCta: { label: 'Laisser un avis', href: data.listingUrl },
    }),
    text: emailTextLayout({
      salutation: `Salut ${data.recipientName},`,
      body:
        `Il y a 2 semaines tu as contacté le proprio de ${data.listingTitle}.\n\n` +
        `Ton avis aide les autres étudiants à choisir.\n` +
        `Laisser un avis : ${data.listingUrl}`,
      cta: data.listingUrl,
    }),
  }
}
