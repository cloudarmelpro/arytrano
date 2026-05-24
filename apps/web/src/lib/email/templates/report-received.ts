import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type ReportReceivedData = {
  recipientName: string
  listingTitle: string
  listingUrl: string
  /** Pre-translated, human-readable reason label (e.g. "Arnaque suspectée").
   *  The service resolves the enum value via the locale dictionary so the
   *  template stays branch-free on the reason. */
  reasonLabel: string
}

/**
 * "Signalement reçu" email (E-T06). Sent to the listing owner when a
 * visitor reports their listing. We surface the **reason only** —
 * never the reporter's free-text details (would let a hostile reporter
 * weaponise the email channel into a harassment vector aimed at the
 * owner). Details remain admin-only via `/admin/reports`.
 *
 * Caller is responsible for skipping this on the dedup return-path of
 * `createReport` (when a duplicate report from the same user collapses
 * onto an existing one, no fresh event is happening).
 */
export function buildReportReceivedEmail(
  locale: Locale,
  data: ReportReceivedData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)
  const safeReason = escapeHtml(data.reasonLabel)

  if (locale === 'mg') {
    return {
      subject: `Filazana nampahalalaina momba ny « ${data.listingTitle} »`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `Misy mpampiasa nanambara ny filazanao <strong>${safeTitle}</strong>.<br/>` +
          `Antony : <strong>${safeReason}</strong>.<br/>` +
          `Ho jeren'ny ekipa moderasiona izany. Tsy mila atao na inona na inona avy aminao raha tsy mahafantatra ny olana izy ireo.`,
        primaryCta: { label: 'Hijery ny filazana', href: data.listingUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body: `Nampahalalaina ny filazanao "${data.listingTitle}". Antony : ${data.reasonLabel}.`,
        cta: data.listingUrl,
      }),
    }
  }

  return {
    subject: `Signalement reçu sur ton annonce « ${data.listingTitle} »`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `Un visiteur a signalé ton annonce <strong>${safeTitle}</strong>.<br/>` +
        `Motif : <strong>${safeReason}</strong>.<br/>` +
        `L'équipe de modération l'examinera. Tu n'as rien à faire de ton côté tant qu'on ne te contacte pas — mais si le motif te paraît évident à corriger (info inexacte, annonce déjà louée…), tu peux mettre à jour l'annonce dès maintenant.`,
      primaryCta: { label: "Voir l'annonce", href: data.listingUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body: `Ton annonce "${data.listingTitle}" a été signalée. Motif : ${data.reasonLabel}.`,
      cta: data.listingUrl,
    }),
  }
}
