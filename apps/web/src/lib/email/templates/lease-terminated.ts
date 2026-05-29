import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type LeaseTerminatedData = {
  /** Recipient display name. */
  recipientName: string
  /** Who reads this — drives the body wording, not the link. */
  audience: 'owner' | 'tenant'
  /** Listing title. */
  listingTitle: string
  /** Full URL to the lease history page. */
  leaseUrl: string
  /** Where to direct the reader for the next step — owner dashboard
   *  for republishing, /annonces catalog for the tenant. */
  ctaUrl: string
}

/**
 * "Le bail est arrivé à son terme" — fired by the
 * terminate-completed-leases cron when an ACTIVE lease reaches its
 * computed end date (startDate + durationMonths). Tone is neutral and
 * forward-looking : the lease ended naturally, no drama.
 *
 * Owner version : reminds them the listing is back in PUBLISHED state
 * and ready for the next bail.
 *
 * Tenant version : thanks them and points them at AryTrano for their
 * next search.
 */
export function buildLeaseTerminatedEmail(
  locale: Locale,
  data: LeaseTerminatedData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)

  if (locale === 'mg') {
    return data.audience === 'owner'
      ? {
          subject: `Vita ny bail — afaka mamoaka indray ny filazana`,
          html: emailHtmlLayout({
            salutation: `Salama ${safeName},`,
            body:
              `<p>Tonga amin'ny fiafarany ny bail ho an'ny <strong>${safeTitle}</strong>.</p>` +
              `<p style="margin-top:12px;">Ny filazanao dia averina amin'ny PUBLISHED — afaka mamoaka indray izy ho an'ny mpanofa hafa, na atao DRAFT raha tsy te-hampiseho intsony.</p>`,
            primaryCta: { label: 'Hijery ny filazanay', href: data.ctaUrl },
            secondaryCta: { label: 'Hijery ny bail', href: data.leaseUrl },
          }),
          text: emailTextLayout({
            salutation: `Salama ${data.recipientName},`,
            body: `Vita ny bail "${data.listingTitle}". Afaka mamoaka indray ny filazana ianao.`,
            cta: data.ctaUrl,
          }),
        }
      : {
          subject: `Vita ny bail — misaotra anao`,
          html: emailHtmlLayout({
            salutation: `Salama ${safeName},`,
            body:
              `<p>Tonga amin'ny fiafarany ny bail ho an'ny <strong>${safeTitle}</strong>.</p>` +
              `<p style="margin-top:12px;">Misaotra anao nampatoky ny AryTrano. Raha mitady trano hafa ianao, ireo dia ao amin'ny catalog-nay.</p>`,
            primaryCta: { label: 'Hijery filazana hafa', href: data.ctaUrl },
            secondaryCta: { label: 'Hijery ny bail', href: data.leaseUrl },
          }),
          text: emailTextLayout({
            salutation: `Salama ${data.recipientName},`,
            body: `Vita ny bail "${data.listingTitle}". Misaotra anao.`,
            cta: data.ctaUrl,
          }),
        }
  }

  return data.audience === 'owner'
    ? {
        subject: `Bail terminé — tu peux republier l'annonce`,
        html: emailHtmlLayout({
          salutation: `Bonjour ${safeName},`,
          body:
            `<p>Le bail pour <strong>${safeTitle}</strong> est arrivé à son terme prévu.</p>` +
            `<p style="margin-top:12px;">Ton annonce repasse automatiquement en statut PUBLISHED — tu peux la republier pour un nouveau locataire, ou la basculer en DRAFT si tu ne veux plus l'afficher.</p>`,
          primaryCta: { label: 'Voir mes annonces', href: data.ctaUrl },
          secondaryCta: { label: 'Voir le bail (historique)', href: data.leaseUrl },
        }),
        text: emailTextLayout({
          salutation: `Bonjour ${data.recipientName},`,
          body: `Le bail "${data.listingTitle}" est terminé. Ton annonce repasse en PUBLISHED, tu peux la republier.`,
          cta: data.ctaUrl,
        }),
      }
    : {
        subject: `Bail terminé — merci de ta confiance`,
        html: emailHtmlLayout({
          salutation: `Bonjour ${safeName},`,
          body:
            `<p>Le bail pour <strong>${safeTitle}</strong> est arrivé à son terme prévu.</p>` +
            `<p style="margin-top:12px;">Merci d'avoir fait confiance à AryTrano. Pour ta prochaine recherche, n'hésite pas à revenir sur notre catalogue.</p>`,
          primaryCta: { label: 'Explorer le catalogue', href: data.ctaUrl },
          secondaryCta: { label: 'Voir le bail (historique)', href: data.leaseUrl },
        }),
        text: emailTextLayout({
          salutation: `Bonjour ${data.recipientName},`,
          body: `Le bail "${data.listingTitle}" est terminé. Merci !`,
          cta: data.ctaUrl,
        }),
      }
}
