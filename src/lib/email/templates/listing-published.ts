import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type ListingPublishedData = {
  recipientName: string
  listingTitle: string
  listingUrl: string
  dashboardUrl: string
}

/**
 * "Annonce publiée" email (T-034). Sent to the owner the first time a
 * draft transitions to PUBLISHED.
 */
export function buildListingPublishedEmail(
  locale: Locale,
  data: ListingPublishedData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)

  if (locale === 'mg') {
    return {
      subject: `Voapetraka ny filazana « ${data.listingTitle} »`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body: `Voapetraka eto an-tserasera amin'ny AryTrano ny filazanao <strong>${safeTitle}</strong>. Afaka jeren'ny mpianatra rehetra izy izao.`,
        primaryCta: { label: 'Hijery ny filazana', href: data.listingUrl },
        secondaryCta: {
          label: "Hijery ao amin'ny tabilao",
          href: data.dashboardUrl,
        },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body: `Voapetraka amin'ny AryTrano ny filazanao "${data.listingTitle}".`,
        cta: data.listingUrl,
      }),
    }
  }

  return {
    subject: `Ton annonce « ${data.listingTitle} » est en ligne`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body: `Ton annonce <strong>${safeTitle}</strong> est désormais visible sur AryTrano. Les étudiants peuvent la consulter et te contacter.`,
      primaryCta: { label: "Voir l'annonce", href: data.listingUrl },
      secondaryCta: {
        label: 'Ouvrir mon tableau de bord',
        href: data.dashboardUrl,
      },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body: `Ton annonce "${data.listingTitle}" est en ligne sur AryTrano.`,
      cta: data.listingUrl,
    }),
  }
}
