import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type VerifyEmailData = {
  recipientName: string
  /** Absolute URL with single-use token query param. */
  verifyUrl: string
}

/**
 * Email sent after sign-up (or via "resend" from /verify-email) with
 * a one-click confirmation link. Token TTL = 24h, see
 * `send-verification-email.ts` for the lifecycle.
 *
 * Kept terse — the more friction-free we make this, the higher our
 * activation rate. No marketing fluff.
 */
export function buildVerifyEmail(
  locale: Locale,
  data: VerifyEmailData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)

  if (locale === 'mg') {
    return {
      subject: 'Hamarino ny adiresinao email AryTrano',
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `Misaotra fa nisoratra anarana tamin\'ny AryTrano. Mba hampandeha ny kaontinao, kasiho ny rohy etsy ambany. ` +
          `Tsy mihoatra ny 24 ora ny faharetan\'io rohy io.<br/><br/>` +
          `Raha tsy ianao no nisoratra anarana, fafao io mailaka io — tsy hisy zavatra hiseho.`,
        primaryCta: { label: 'Hamarino ny email', href: data.verifyUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body:
          `Hamarino ny adiresinao email mba hampandeha ny kaontinao AryTrano.\n` +
          `Ity ny rohy (mahasahy 24 ora) :\n${data.verifyUrl}`,
        cta: data.verifyUrl,
      }),
    }
  }

  return {
    subject: 'Confirme ton adresse email AryTrano',
    html: emailHtmlLayout({
      salutation: `Salut ${safeName},`,
      body:
        `Merci de t\'être inscrit sur AryTrano. Pour activer ton compte, clique sur le bouton ci-dessous. ` +
        `Ce lien est valide pendant 24 heures.<br/><br/>` +
        `Tu n\'es pas à l\'origine de cette inscription ? Ignore simplement cet email — aucun compte ne sera créé sans confirmation.`,
      primaryCta: { label: 'Confirmer mon email', href: data.verifyUrl },
    }),
    text: emailTextLayout({
      salutation: `Salut ${data.recipientName},`,
      body:
        `Confirme ton adresse email pour activer ton compte AryTrano.\n` +
        `Lien (valide 24 h) :\n${data.verifyUrl}`,
      cta: data.verifyUrl,
    }),
  }
}
