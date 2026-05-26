import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type LeaseTenantSignedData = {
  /** Owner display name. */
  recipientName: string
  /** Tenant display name. */
  tenantName: string
  /** Listing title. */
  listingTitle: string
  /** Full URL to the lease detail page. */
  leaseUrl: string
}

/**
 * "Ton locataire a accepté le bail" — sent to the OWNER when the
 * tenant clicks Accept on a PENDING_TENANT lease.
 *
 * Trigger: tenantSignLease() service after Lease.status → ACTIVE and
 * Listing.status → RENTED. Side note: this is the moment the success
 * fee becomes "earned" from AryTrano's perspective.
 */
export function buildLeaseTenantSignedEmail(
  locale: Locale,
  data: LeaseTenantSignedData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTenant = escapeHtml(data.tenantName)
  const safeTitle = escapeHtml(data.listingTitle)

  if (locale === 'mg') {
    return {
      subject: `${data.tenantName} dia nanao sonia ny bail`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `<p><strong>${safeTenant}</strong> dia nanao sonia ny bail ho an'ny <strong>${safeTitle}</strong>. Mavitrika izao ny bail.</p>` +
          `<p style="margin-top:12px;">Ny filazanao dia voafono ho « Voa-hofa » ary tsy hita amin'ny tahirin'olom-pirenena intsony. Ireto ny manaraka :</p>` +
          `<ul style="margin-top:8px; padding-left:18px;">` +
          `<li>Manangana ny fanorenana toetra elektronika amin'ny pejy bail (sary fidirana)</li>` +
          `<li>Mandray ny antoka mivantana avy amin'ny mpanofa</li>` +
          `<li>Manome ny lakile</li>` +
          `</ul>`,
        primaryCta: { label: 'Hijery ny bail', href: data.leaseUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body: `${data.tenantName} dia nanao sonia ny bail "${data.listingTitle}". Mavitrika izao.`,
        cta: data.leaseUrl,
      }),
    }
  }

  return {
    subject: `${data.tenantName} a accepté le bail`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `<p><strong>${safeTenant}</strong> a signé le bail pour <strong>${safeTitle}</strong>. Le bail est désormais actif.</p>` +
        `<p style="margin-top:12px;">Ton annonce passe en « Louée » et n'apparaît plus dans le catalogue public. Voici les prochaines étapes :</p>` +
        `<ul style="margin-top:8px; padding-left:18px;">` +
        `<li>Réaliser l'état des lieux numérique sur la page du bail (photos d'entrée)</li>` +
        `<li>Encaisser la caution directement auprès du locataire</li>` +
        `<li>Remettre les clés</li>` +
        `</ul>`,
      primaryCta: { label: 'Voir le bail', href: data.leaseUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body: `${data.tenantName} a signé le bail "${data.listingTitle}". Le bail est désormais actif.`,
      cta: data.leaseUrl,
    }),
  }
}
