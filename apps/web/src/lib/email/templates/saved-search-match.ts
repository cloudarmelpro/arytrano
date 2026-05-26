import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type SavedSearchMatchData = {
  /** Display name of the recipient (falls back to "locataire"). */
  recipientName: string
  /** Title of the listing that matched (escaped at render time). */
  listingTitle: string
  /** Quartier / city display label (escaped). */
  locationLabel: string
  /** Monthly rent formatted in Ariary (caller passes the formatted string). */
  monthlyRentFormatted: string
  /** Full URL to the listing detail page. */
  listingUrl: string
  /** Full URL to the saved-search settings (so user can disable alerts). */
  manageSearchUrl: string
}

/**
 * E-T09 — Email fallback when a newly published listing matches a
 * saved search owned by a user who has NOT installed the mobile app
 * (so `expoPushToken` is null). Push subscribers already get notified
 * via `notifySavedSearchMatches` — this template covers the web-only
 * audience.
 *
 * Security note (memory `feedback_email_header_injection`): the
 * `listingTitle` is sanitized at the call site via
 * `sanitizeEmailHeaderValue` before it flows into the Subject header.
 * In-body interpolations all pass through `escapeHtml`.
 *
 * Security note 2: the email INTENTIONALLY does not echo the
 * `savedSearch.name` — saved-search names are user-written strings
 * that may contain private hints (neighborhood, budget). Memory of the
 * push-side leak applies here too.
 */
export function buildSavedSearchMatchEmail(
  locale: Locale,
  data: SavedSearchMatchData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)
  const safeLocation = escapeHtml(data.locationLabel)
  const safeRent = escapeHtml(data.monthlyRentFormatted)

  if (locale === 'mg') {
    return {
      subject: `Filazana vaovao mifanaraka amin'ny fitadiavanao`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body: `
          <p style="margin:0 0 12px">Misy filazana vaovao mifanaraka amin'ny fitadiavanao voatahiry.</p>
          <p style="margin:0 0 12px"><strong>${safeTitle}</strong> &mdash; ${safeLocation}</p>
          <p style="margin:0 0 12px;font-family:ui-monospace,monospace">${safeRent} / volana</p>
        `,
        primaryCta: {
          label: `Jereo ny filazana`,
          href: data.listingUrl,
        },
        secondaryCta: {
          label: `Hanova ny fanairana fitadiavana`,
          href: data.manageSearchUrl,
        },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body: `Misy filazana vaovao mifanaraka amin'ny fitadiavanao.\n\n${data.listingTitle} — ${data.locationLabel}\n${data.monthlyRentFormatted} / volana`,
        cta: `Jereo ny filazana : ${data.listingUrl}\nHanova ny fanairana : ${data.manageSearchUrl}`,
      }),
    }
  }

  return {
    subject: `Une nouvelle annonce correspond à ta recherche`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body: `
        <p style="margin:0 0 12px">Une nouvelle annonce vient d'être publiée et correspond à l'une de tes recherches sauvegardées.</p>
        <p style="margin:0 0 12px"><strong>${safeTitle}</strong> &mdash; ${safeLocation}</p>
        <p style="margin:0 0 12px;font-family:ui-monospace,monospace">${safeRent} / mois</p>
      `,
      primaryCta: {
        label: `Voir l'annonce`,
        href: data.listingUrl,
      },
      secondaryCta: {
        label: `Gérer mes alertes de recherche`,
        href: data.manageSearchUrl,
      },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body: `Une nouvelle annonce correspond à l'une de tes recherches sauvegardées.\n\n${data.listingTitle} — ${data.locationLabel}\n${data.monthlyRentFormatted} / mois`,
      cta: `Voir l'annonce : ${data.listingUrl}\nGérer mes alertes : ${data.manageSearchUrl}`,
    }),
  }
}
