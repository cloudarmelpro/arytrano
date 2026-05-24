import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type ReviewRepliedData = {
  recipientName: string
  listingTitle: string
  listingUrl: string
  ownerDisplayName: string
  /** Plain-text, ≤200-char excerpt of the owner's response. Caller trims. */
  responseExcerpt: string
}

/**
 * "Réponse à ton avis" email (E-T06). Sent to a review author when the
 * listing owner posts their FIRST public response (null → set) to that
 * review. Subsequent edits do not re-trigger the email; the
 * `respondToReview` caller checks the previous value and skips otherwise.
 * The rate limit in `sendTransactionalEmail` still caps the worst case.
 */
export function buildReviewRepliedEmail(
  locale: Locale,
  data: ReviewRepliedData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)
  const safeOwner = escapeHtml(data.ownerDisplayName)
  const safeExcerpt = escapeHtml(data.responseExcerpt)

  if (locale === 'mg') {
    return {
      subject: `Namaly ny hevitrao i ${data.ownerDisplayName}`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `<strong>${safeOwner}</strong>, tompon'ny filazana <strong>${safeTitle}</strong>, dia namaly ny hevitrao :<br/>` +
          `<em>« ${safeExcerpt} »</em>`,
        primaryCta: { label: 'Hijery ny valiny', href: data.listingUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body: `${data.ownerDisplayName} namaly ny hevitrao momba ny "${data.listingTitle}" :\n"${data.responseExcerpt}"`,
        cta: data.listingUrl,
      }),
    }
  }

  return {
    subject: `${data.ownerDisplayName} a répondu à ton avis`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `<strong>${safeOwner}</strong>, propriétaire de l'annonce <strong>${safeTitle}</strong>, a publié une réponse publique à ton avis :<br/>` +
        `<em>« ${safeExcerpt} »</em>`,
      primaryCta: { label: 'Voir la réponse', href: data.listingUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body: `${data.ownerDisplayName} a répondu à ton avis sur "${data.listingTitle}" :\n"${data.responseExcerpt}"`,
      cta: data.listingUrl,
    }),
  }
}
