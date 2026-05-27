import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type LeaseOwnerCanceledData = {
  /** Tenant display name (recipient). */
  recipientName: string
  /** Owner display name. */
  ownerName: string
  /** Listing title. */
  listingTitle: string
  /** Optional reason given by the owner (already sanitized + truncated). */
  reason?: string
  /** Full URL to the lease detail page (history view). */
  leaseUrl: string
  /** Full URL to /annonces so the tenant can find another listing. */
  catalogUrl: string
}

/**
 * "Le propriétaire a annulé le bail" — sent to the TENANT when the
 * owner cancels a PENDING_TENANT lease (tenant never accepted in time
 * OR owner changed their mind). Includes the optional reason and
 * encourages the tenant to keep searching on AryTrano.
 *
 * No refund mention on the tenant side — the tenant pays nothing for
 * the signature fee in v0 (only the owner does). If we add tenant-side
 * fees in v1, this template needs updating.
 */
export function buildLeaseOwnerCanceledEmail(
  locale: Locale,
  data: LeaseOwnerCanceledData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeOwner = escapeHtml(data.ownerName)
  const safeTitle = escapeHtml(data.listingTitle)
  const safeReason = data.reason ? escapeHtml(data.reason) : null

  if (locale === 'mg') {
    return {
      subject: `Ny tompo dia nanafoana ny bail`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `<p><strong>${safeOwner}</strong> dia nanafoana ny bail ho an'ny <strong>${safeTitle}</strong>.</p>` +
          (safeReason
            ? `<p style="margin-top:12px;"><strong>Antony :</strong><br/>« ${safeReason} »</p>`
            : '') +
          `<p style="margin-top:12px;">Ny filazana dia averina amin'ny tahirin'olom-pirenena. Afaka mitady trano hafa amin'ny AryTrano ianao.</p>`,
        primaryCta: { label: 'Mitady trano', href: data.catalogUrl },
        secondaryCta: { label: 'Hijery ny bail', href: data.leaseUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body:
          `${data.ownerName} dia nanafoana ny bail "${data.listingTitle}".` +
          (data.reason ? ` Antony : ${data.reason}.` : '') +
          ` Afaka mitady trano hafa ianao : ${data.catalogUrl}`,
        cta: data.leaseUrl,
      }),
    }
  }

  return {
    subject: `Le propriétaire a annulé le bail`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `<p><strong>${safeOwner}</strong> a annulé le bail pour <strong>${safeTitle}</strong>.</p>` +
        (safeReason
          ? `<p style="margin-top:12px;"><strong>Raison :</strong><br/>« ${safeReason} »</p>`
          : '') +
        `<p style="margin-top:12px;">L'annonce redevient disponible dans le catalogue. Tu peux explorer d'autres logements sur AryTrano à tout moment.</p>`,
      primaryCta: { label: 'Explorer le catalogue', href: data.catalogUrl },
      secondaryCta: { label: 'Voir le bail', href: data.leaseUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body:
        `${data.ownerName} a annulé le bail "${data.listingTitle}".` +
        (data.reason ? ` Raison : ${data.reason}.` : '') +
        ` Tu peux trouver un autre logement ici : ${data.catalogUrl}`,
      cta: data.leaseUrl,
    }),
  }
}
