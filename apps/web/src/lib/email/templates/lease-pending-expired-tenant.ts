import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type LeasePendingExpiredTenantData = {
  /** Tenant display name (recipient). */
  recipientName: string
  /** Listing title. */
  listingTitle: string
  /** Full URL to the lease detail page (history view). */
  leaseUrl: string
  /** Full URL to /annonces. */
  catalogUrl: string
}

/**
 * "Ton invitation à signer a expiré" — sent to the TENANT when the
 * `expire-pending-leases` cron auto-REFUSES a PENDING_TENANT lease
 * past its acceptance window (default 14 days). No tone of blame —
 * the tenant may simply not have seen the original email. Encourage
 * them to keep browsing AryTrano.
 */
export function buildLeasePendingExpiredTenantEmail(
  locale: Locale,
  data: LeasePendingExpiredTenantData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)

  if (locale === 'mg') {
    return {
      subject: `Lany andro ny fiantsoana hanao sonia bail`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `<p>Ny fiantsoana hanao sonia bail ho an'ny <strong>${safeTitle}</strong> dia lany andro raha tsy nisy valiny tao anatin'ny 14 andro.</p>` +
          `<p style="margin-top:12px;">Tsy misy olana — afaka mitady trano hafa amin'ny AryTrano ianao. Maro ny safidy mety.</p>`,
        primaryCta: { label: 'Mitady trano', href: data.catalogUrl },
        secondaryCta: { label: 'Hijery ny bail teo aloha', href: data.leaseUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body:
          `Lany andro ny bail "${data.listingTitle}".` +
          ` Afaka mitady trano hafa ianao : ${data.catalogUrl}`,
        cta: data.leaseUrl,
      }),
    }
  }

  return {
    subject: `Ton invitation à signer un bail a expiré`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `<p>Ton invitation à signer le bail pour <strong>${safeTitle}</strong> a expiré faute de réponse sous 14 jours.</p>` +
        `<p style="margin-top:12px;">Pas de souci — tu peux explorer d'autres logements sur AryTrano à tout moment.</p>`,
      primaryCta: { label: 'Explorer le catalogue', href: data.catalogUrl },
      secondaryCta: { label: 'Voir le bail (historique)', href: data.leaseUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body:
        `Ton invitation à signer le bail "${data.listingTitle}" a expiré.` +
        ` Tu peux trouver un autre logement ici : ${data.catalogUrl}`,
      cta: data.leaseUrl,
    }),
  }
}
