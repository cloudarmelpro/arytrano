import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type ReviewReceivedData = {
  recipientName: string
  listingTitle: string
  reviewerDisplayName: string
  rating: number
  /** First ~200 chars of the review body, plain text — caller already trimmed. */
  reviewExcerpt: string
  listingUrl: string
  verifiedStay: boolean
}

/**
 * "Avis reçu" email (T-034). Sent to the listing owner when a student
 * submits a new review on one of their PUBLISHED listings.
 */
export function buildReviewReceivedEmail(
  locale: Locale,
  data: ReviewReceivedData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeTitle = escapeHtml(data.listingTitle)
  const safeReviewer = escapeHtml(data.reviewerDisplayName)
  const safeExcerpt = escapeHtml(data.reviewExcerpt)
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating)

  if (locale === 'mg') {
    const verifTag = data.verifiedStay ? ' (mpamonjy voamarina)' : ''
    return {
      subject: `Hevitra vaovao momba ny filazanao « ${data.listingTitle} »`,
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `Nanoratra hevitra vaovao i <strong>${safeReviewer}</strong>${verifTag} momba ny filazanao <strong>${safeTitle}</strong>.<br/>` +
          `<span style="display:inline-block;margin:8px 0;color:#4f46e5;font-size:18px">${stars}</span><br/>` +
          `<em>« ${safeExcerpt} »</em>`,
        primaryCta: { label: 'Hijery ny hevitra', href: data.listingUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body: `${data.reviewerDisplayName}${verifTag} : ${data.rating}/5\n"${data.reviewExcerpt}"`,
        cta: data.listingUrl,
      }),
    }
  }

  const verifTag = data.verifiedStay ? ' (séjour confirmé)' : ''
  return {
    subject: `Nouvel avis sur ton annonce « ${data.listingTitle} »`,
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `<strong>${safeReviewer}</strong>${verifTag} vient de laisser un avis sur ton annonce <strong>${safeTitle}</strong>.<br/>` +
        `<span style="display:inline-block;margin:8px 0;color:#4f46e5;font-size:18px">${stars}</span><br/>` +
        `<em>« ${safeExcerpt} »</em>`,
      primaryCta: { label: "Voir l'avis", href: data.listingUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body: `${data.reviewerDisplayName}${verifTag} a laissé un avis (${data.rating}/5) :\n"${data.reviewExcerpt}"`,
      cta: data.listingUrl,
    }),
  }
}
