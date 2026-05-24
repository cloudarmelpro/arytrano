import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type ListingExpiringData = {
  recipientName: string
  listingTitle: string
  /** Days remaining (always 7 today, but kept dynamic for future cycles). */
  daysLeft: number
  /** Public dashboard URL where owner can click "Prolonger". */
  dashboardUrl: string
}

/**
 * 7-day expiration warning (T-049). Fires once per cycle — the
 * orchestrator marks `expirationAlertSentAt` after success so the
 * owner doesn't get the same nag every day. Cleared on extend so
 * a future expiration starts a fresh warning window.
 *
 * Tone : matter-of-fact, no alarm. Many owners pause listings
 * intentionally between tenants.
 */
export function buildListingExpiringEmail(
  locale: Locale,
  data: ListingExpiringData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)

  if (locale === 'mg') {
    return {
      subject: `Hiala ny filazana « ${data.listingTitle} » afaka ${data.daysLeft} andro`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `Hiala amin\'ny daholobe ny filazana <strong>${safeTitle}</strong> afaka ${data.daysLeft} andro raha tsy halavainao.<br/><br/>` +
          `Mbola misy mpianatra mitady ? Tsindrio « Halavaina » ao amin\'ny dashboard mba hampifoha azy 60 andro hafa.<br/><br/>` +
          `Raha tsy ilaina intsony : tsy mila zavatra atao. Hiverina amin\'ny « Tsy misy » ny sata aorian\'ny daty hialana.`,
        primaryCta: { label: 'Halavaina ny filazana', href: data.dashboardUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body:
          `${data.listingTitle} : hiala afaka ${data.daysLeft} andro.\n` +
          `Halavaina amin\'ny dashboard : ${data.dashboardUrl}`,
        cta: data.dashboardUrl,
      }),
    }
  }

  return {
    subject: `« ${data.listingTitle} » expire dans ${data.daysLeft} jours`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `Ton annonce <strong>${safeTitle}</strong> sera retirée du catalogue public dans ${data.daysLeft} jours, sauf prolongation.<br/><br/>` +
        `Toujours en recherche de locataire ? Clique sur « Prolonger » dans le dashboard — l\'annonce repart pour 60 jours.<br/><br/>` +
        `Plus besoin ? Rien à faire. L\'annonce passera automatiquement en « Indisponible » à la date d\'expiration et tes locataires actuels gardent un lien valide.`,
      primaryCta: { label: 'Prolonger l\'annonce', href: data.dashboardUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body:
        `${data.listingTitle} expire dans ${data.daysLeft} jours.\n` +
        `Prolonger depuis le dashboard : ${data.dashboardUrl}`,
      cta: data.dashboardUrl,
    }),
  }
}
