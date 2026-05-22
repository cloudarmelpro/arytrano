import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type ListingExpiredData = {
  recipientName: string
  listingTitle: string
  dashboardUrl: string
}

/**
 * Sent right after the cron flips a listing from PUBLISHED to
 * UNAVAILABLE (T-049). Lets the owner know their annonce just left
 * the catalog and that re-publishing is one click away.
 *
 * We deliberately use UNAVAILABLE, not DELETED — the owner keeps the
 * data, and a re-publish bumps publishedAt + resets expiresAt. No
 * SEO loss : the public route handles UNAVAILABLE with a permanent
 * redirect to /annonces.
 */
export function buildListingExpiredEmail(
  locale: Locale,
  data: ListingExpiredData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)

  if (locale === 'mg') {
    return {
      subject: `Voaesotra amin\'ny daholobe ny « ${data.listingTitle} »`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `Voaesotra amin\'ny daholobe ny filazana <strong>${safeTitle}</strong> noho ny faharetana 60 andro.<br/><br/>` +
          `Mbola eo ny anao — tsy voafafa. Tsindrio « Avoaka indray » ao amin\'ny dashboard mba hampiseho azy indray ho an\'ny mpianatra mandritra ny 60 andro.<br/><br/>` +
          `Tsy ilaina intsony ? Tsy mila atao na inona na inona — ho ao anaty arsiva izy.`,
        primaryCta: { label: 'Hijery ny dashboard', href: data.dashboardUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body:
          `${data.listingTitle} : voaesotra amin\'ny daholobe.\n` +
          `Hamerina amin\'ny dashboard : ${data.dashboardUrl}`,
        cta: data.dashboardUrl,
      }),
    }
  }

  return {
    subject: `« ${data.listingTitle} » retirée du catalogue`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `Ton annonce <strong>${safeTitle}</strong> a été retirée du catalogue public après 60 jours en ligne.<br/><br/>` +
        `Rien n\'est perdu — les données restent en place. Clique sur « Republier » dans le dashboard pour la remettre en vitrine pour 60 jours.<br/><br/>` +
        `Plus besoin ? Aucune action nécessaire — l\'annonce reste archivée côté propriétaire.`,
      primaryCta: { label: 'Voir le dashboard', href: data.dashboardUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body:
        `${data.listingTitle} : retirée du catalogue public.\n` +
        `Republier depuis le dashboard : ${data.dashboardUrl}`,
      cta: data.dashboardUrl,
    }),
  }
}
