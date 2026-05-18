import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type ListingVerifiedData = {
  recipientName: string
  listingTitle: string
  listingUrl: string
}

/**
 * "Annonce vérifiée" email (T-034). Sent to the listing owner when an
 * admin marks the listing as verified — celebratory tone, encourages the
 * owner to share the badge.
 */
export function buildListingVerifiedEmail(
  locale: Locale,
  data: ListingVerifiedData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)

  if (locale === 'mg') {
    return {
      subject: `Voamarina ny filazanao « ${data.listingTitle} »`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `Vita fanamarinana ny filazanao <strong>${safeTitle}</strong> avy amin'ny ekipan'ny AryTrano. ` +
          `Hahita marika « <strong>Filazana voamarina</strong> » ny mpianatra mizaha azy.`,
        primaryCta: { label: 'Hijery ny filazana', href: data.listingUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body: `Voamarina ny filazanao "${data.listingTitle}". Hahita ilay marika "Filazana voamarina" ny mpianatra.`,
        cta: data.listingUrl,
      }),
    }
  }

  return {
    subject: `Ton annonce « ${data.listingTitle} » est vérifiée`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `L'équipe AryTrano a vérifié ton annonce <strong>${safeTitle}</strong>. ` +
        `Les étudiants qui la consultent voient maintenant le badge « <strong>Annonce vérifiée</strong> » — un vrai signal de confiance.`,
      primaryCta: { label: "Voir l'annonce", href: data.listingUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body: `Ton annonce "${data.listingTitle}" est désormais marquée "Annonce vérifiée" par l'équipe AryTrano.`,
      cta: data.listingUrl,
    }),
  }
}
