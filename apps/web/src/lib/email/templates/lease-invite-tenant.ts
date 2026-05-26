import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type LeaseInviteTenantData = {
  /** Display name of the tenant (falls back to email split). */
  recipientName: string
  /** Display name of the owner who signed first. */
  ownerName: string
  /** Listing title — the property being leased. */
  listingTitle: string
  /** Monthly rent formatted in Ariary (caller passes the formatted string). */
  monthlyRentFormatted: string
  /** Caution formatted in Ariary (use "0 Ar" if no caution). */
  cautionFormatted: string
  /** Full URL to the lease detail page where the tenant accepts/refuses. */
  leaseUrl: string
}

/**
 * "Un propriétaire t'invite à signer un bail" email — sent when the
 * Lease transitions DRAFT → PENDING_TENANT (i.e. owner paid the
 * signature fee via GoalPay).
 *
 * The tenant clicks the CTA, lands on /dashboard/leases/[id], and can
 * Accept (Lease → ACTIVE) or Refuse (Lease → REFUSED + refund queued).
 */
export function buildLeaseInviteTenantEmail(
  locale: Locale,
  data: LeaseInviteTenantData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeOwner = escapeHtml(data.ownerName)
  const safeTitle = escapeHtml(data.listingTitle)
  const safeRent = escapeHtml(data.monthlyRentFormatted)
  const safeCaution = escapeHtml(data.cautionFormatted)

  if (locale === 'mg') {
    return {
      subject: `${data.ownerName} dia manasa anao hanao sonia bail amin'ny AryTrano`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `<p><strong>${safeOwner}</strong> dia nanao sonia bail ho an'ny <strong>${safeTitle}</strong> ary manasa anao hanao sonia toy izany koa.</p>` +
          `<p style="margin-top:12px;"><strong>Hofa isam-bolana :</strong> ${safeRent}<br/>` +
          `<strong>Antoka :</strong> ${safeCaution}</p>` +
          `<p style="margin-top:12px;">Jereo ny fepetra rehetra eo amin'ny tabilao-nao. Afaka manaiky na mandà ianao.</p>`,
        primaryCta: { label: 'Hijery ny bail', href: data.leaseUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body: `${data.ownerName} dia manasa anao hanao sonia bail ho an'ny "${data.listingTitle}". Hofa: ${data.monthlyRentFormatted}. Antoka: ${data.cautionFormatted}.`,
        cta: data.leaseUrl,
      }),
    }
  }

  return {
    subject: `${data.ownerName} t'invite à signer un bail sur AryTrano`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `<p><strong>${safeOwner}</strong> a signé un bail pour <strong>${safeTitle}</strong> et t'invite à signer à ton tour.</p>` +
        `<p style="margin-top:12px;"><strong>Loyer mensuel :</strong> ${safeRent}<br/>` +
        `<strong>Caution :</strong> ${safeCaution}</p>` +
        `<p style="margin-top:12px;">Vérifie les conditions sur ton tableau de bord. Tu peux accepter ou refuser le bail.</p>`,
      primaryCta: { label: 'Voir le bail', href: data.leaseUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body: `${data.ownerName} t'invite à signer un bail pour "${data.listingTitle}". Loyer : ${data.monthlyRentFormatted}. Caution : ${data.cautionFormatted}.`,
      cta: data.leaseUrl,
    }),
  }
}
