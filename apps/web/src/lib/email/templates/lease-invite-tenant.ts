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
  /** Platform fee the TENANT pays to AryTrano at acceptance, formatted in Ariary. */
  platformFeeFormatted: string
  /** Full URL to the lease detail page where the tenant accepts/refuses. */
  leaseUrl: string
}

/**
 * "Un propriétaire t'invite à signer un bail" email — sent when the
 * owner creates a Lease (revised E-T26, 2026-05-27 — owner pays nothing,
 * tenant pays the platform fee at acceptance).
 *
 * The tenant clicks the CTA, lands on /dashboard/leases/[id], and can
 * "Accepter et payer X Ar" (Lease → ACTIVE after GoalPay success) or
 * Refuse (Lease → REFUSED, no money charged).
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
  const safeFee = escapeHtml(data.platformFeeFormatted)

  if (locale === 'mg') {
    return {
      subject: `${data.ownerName} dia manasa anao hanao sonia bail amin'ny AryTrano`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `<p><strong>${safeOwner}</strong> dia te-hanofa <strong>${safeTitle}</strong> aminao ary manasa anao hanao sonia bail amin'ny AryTrano.</p>` +
          `<p style="margin-top:12px;"><strong>Hofa isam-bolana :</strong> ${safeRent}<br/>` +
          `<strong>Antoka :</strong> ${safeCaution}<br/>` +
          `<strong>Saran'ny AryTrano (aloanao) :</strong> ${safeFee}</p>` +
          `<p style="margin-top:12px;">Mba hanaovana sonia ny bail, aloa ny saran'ny AryTrano (20%-n'ny hofan-trano). Ny hofa sy ny antoka dia atolotrao mivantana amin'ny tompon-trano (tsy amin'ny AryTrano).</p>`,
        primaryCta: { label: 'Hijery ny bail', href: data.leaseUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body: `${data.ownerName} dia manasa anao hanao sonia bail ho an'ny "${data.listingTitle}". Hofa: ${data.monthlyRentFormatted}. Antoka: ${data.cautionFormatted}. Saran'ny AryTrano: ${data.platformFeeFormatted}.`,
        cta: data.leaseUrl,
      }),
    }
  }

  return {
    subject: `${data.ownerName} t'invite à signer un bail sur AryTrano`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `<p><strong>${safeOwner}</strong> te propose <strong>${safeTitle}</strong> et t'invite à signer un bail sur AryTrano.</p>` +
        `<p style="margin-top:12px;"><strong>Loyer mensuel :</strong> ${safeRent}<br/>` +
        `<strong>Caution :</strong> ${safeCaution}<br/>` +
        `<strong>Frais AryTrano (à ta charge) :</strong> ${safeFee}</p>` +
        `<p style="margin-top:12px;">Pour signer le bail, tu paies les frais AryTrano (20% du loyer mensuel) à l'acceptation. Le loyer + la caution sont versés directement au propriétaire (hors AryTrano).</p>`,
      primaryCta: { label: 'Voir le bail', href: data.leaseUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body: `${data.ownerName} t'invite à signer un bail pour "${data.listingTitle}". Loyer : ${data.monthlyRentFormatted}. Caution : ${data.cautionFormatted}. Frais AryTrano : ${data.platformFeeFormatted}.`,
      cta: data.leaseUrl,
    }),
  }
}
