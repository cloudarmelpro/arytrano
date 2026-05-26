import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type LeaseTenantRefusedData = {
  /** Owner display name. */
  recipientName: string
  /** Tenant display name. */
  tenantName: string
  /** Listing title. */
  listingTitle: string
  /** Optional reason provided by the tenant (already sanitized + truncated). */
  reason?: string
  /** Full URL to the lease detail page (history view). */
  leaseUrl: string
}

/**
 * "Ton locataire a refusé le bail" — sent to the OWNER when the
 * tenant clicks Refuse on a PENDING_TENANT lease.
 *
 * Includes the reason if the tenant provided one. The Payment status
 * is queued to REFUND_PENDING by the service — the email reassures
 * the owner that AryTrano will contact GoalPay support for refund.
 */
export function buildLeaseTenantRefusedEmail(
  locale: Locale,
  data: LeaseTenantRefusedData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTenant = escapeHtml(data.tenantName)
  const safeTitle = escapeHtml(data.listingTitle)
  const safeReason = data.reason ? escapeHtml(data.reason) : null

  if (locale === 'mg') {
    return {
      subject: `${data.tenantName} dia nandà ny bail`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `<p><strong>${safeTenant}</strong> dia nandà ny bail ho an'ny <strong>${safeTitle}</strong>.</p>` +
          (safeReason
            ? `<p style="margin-top:12px;"><strong>Antony nomeny :</strong><br/>« ${safeReason} »</p>`
            : '') +
          `<p style="margin-top:12px;">Ny filazanao dia mijanona ho hita amin'ny tahirin'olom-pirenena. Afaka manomboka bail vaovao amin'ny mpanofa hafa ianao.</p>` +
          `<p style="margin-top:12px;">Ny saran'ny sonia AryTrano efa naloanao dia averina any aminao ao anatin'ny 48 ora — ny ekipanay miresaka amin'ny GoalPay manokana.</p>`,
        primaryCta: { label: 'Hijery ny bail', href: data.leaseUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body:
          `${data.tenantName} dia nandà ny bail "${data.listingTitle}".` +
          (data.reason ? ` Antony : ${data.reason}.` : '') +
          ' Ny saranao dia averina any anatin\'ny 48 ora.',
        cta: data.leaseUrl,
      }),
    }
  }

  return {
    subject: `${data.tenantName} a refusé le bail`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `<p><strong>${safeTenant}</strong> a refusé le bail pour <strong>${safeTitle}</strong>.</p>` +
        (safeReason
          ? `<p style="margin-top:12px;"><strong>Raison invoquée :</strong><br/>« ${safeReason} »</p>`
          : '') +
        `<p style="margin-top:12px;">Ton annonce reste visible dans le catalogue. Tu peux démarrer un nouveau bail avec un autre locataire à tout moment.</p>` +
        `<p style="margin-top:12px;">Les frais de signature AryTrano payés sont remboursés sous 48h — notre équipe contacte GoalPay manuellement (l'API de refund n'est pas exposée par le provider).</p>`,
      primaryCta: { label: 'Voir le bail', href: data.leaseUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body:
        `${data.tenantName} a refusé le bail "${data.listingTitle}".` +
        (data.reason ? ` Raison : ${data.reason}.` : '') +
        ' Les frais payés sont remboursés sous 48h.',
      cta: data.leaseUrl,
    }),
  }
}
