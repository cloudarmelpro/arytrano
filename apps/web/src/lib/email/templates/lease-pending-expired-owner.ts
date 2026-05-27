import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type LeasePendingExpiredOwnerData = {
  /** Owner display name (recipient). */
  recipientName: string
  /** Listing title. */
  listingTitle: string
  /** Full URL to the lease detail page (history view). */
  leaseUrl: string
  /** Full URL to the owner's listings dashboard. */
  dashboardUrl: string
}

/**
 * "Le bail a expiré faute de réponse du locataire" — sent to the
 * OWNER when the cron auto-REFUSES a stale PENDING_TENANT lease. The
 * listing is automatically freed in the catalog. Reassure on the
 * refund queue (admin reviews case by case).
 */
export function buildLeasePendingExpiredOwnerEmail(
  locale: Locale,
  data: LeasePendingExpiredOwnerData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)

  if (locale === 'mg') {
    return {
      subject: `Lany andro ny bail — voafongotra ny filazana`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `<p>Ny bail ho an'ny <strong>${safeTitle}</strong> dia lany andro satria tsy namaly tao anatin'ny 14 andro ny mpanofa.</p>` +
          `<p style="margin-top:12px;">Ny filazanao dia averina amin'ny tahirin'olom-pirenena izao. Afaka manomboka bail vaovao amin'ny mpanofa hafa ianao na manova ny filazana.</p>` +
          `<p style="margin-top:12px;">Ny saran'ny sonia efa naloanao dia jeren'ny ekipanay isan-tsokajiny. Mifandray aminao izahay raha misy fihetsika fanasoavana.</p>`,
        primaryCta: { label: 'Hijery ny filazanay', href: data.dashboardUrl },
        secondaryCta: { label: 'Hijery ny bail teo aloha', href: data.leaseUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body:
          `Lany andro ny bail "${data.listingTitle}" — voafongotra ny filazana.` +
          ` Hijerena ny dashboard : ${data.dashboardUrl}`,
        cta: data.leaseUrl,
      }),
    }
  }

  return {
    subject: `Bail expiré — ton annonce est libérée`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `<p>Le bail pour <strong>${safeTitle}</strong> a expiré : le locataire n'a pas répondu sous 14 jours.</p>` +
        `<p style="margin-top:12px;">Ton annonce redevient automatiquement disponible dans le catalogue. Tu peux relancer un bail avec un autre locataire ou ajuster l'annonce.</p>` +
        `<p style="margin-top:12px;">Le frais de signature payé est examiné par notre équipe au cas par cas — on revient vers toi si un geste commercial s'applique.</p>`,
      primaryCta: { label: 'Voir mes annonces', href: data.dashboardUrl },
      secondaryCta: { label: 'Voir le bail (historique)', href: data.leaseUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body:
        `Le bail "${data.listingTitle}" a expiré — ton annonce est libérée.` +
        ` Dashboard : ${data.dashboardUrl}`,
      cta: data.leaseUrl,
    }),
  }
}
