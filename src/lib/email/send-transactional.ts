import 'server-only'
import { rateLimiters } from '@/lib/rate-limit'
import { sendEmail } from './index'

export type TransactionalEventType =
  | 'listing-published'
  | 'review-received'
  | 'review-prompt'
  | 'listing-verified'
  | 'report-received'
  | 'review-replied'
  | 'cin-approved'
  | 'cin-rejected'

/**
 * Wrap `sendEmail` with per-user-per-event rate limiting (T-034). Used by
 * the services that emit transactional notifications to owners + authors.
 *
 * Failure semantics: this never throws. If the rate limit blocks the send,
 * or SMTP errors out, we log and return — the caller (publishListing,
 * createReview, verifyListing) must succeed even if the email pipeline
 * has hiccups. The user-facing operation comes first.
 */
export async function sendTransactionalEmail(opts: {
  /** Recipient user id — drives the rate limit key. */
  recipientId: string
  recipientEmail: string
  eventType: TransactionalEventType
  subject: string
  html: string
  text: string
}): Promise<void> {
  const rl = await rateLimiters.transactionalEmail(
    opts.recipientId,
    opts.eventType,
  )
  if (!rl.success) {
    console.warn(
      `[email] rate-limited (${opts.eventType}) for user ${opts.recipientId}`,
    )
    return
  }
  try {
    await sendEmail({
      to: opts.recipientEmail,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    })
  } catch (err) {
    // Never propagate — the parent service must keep its happy path.
    console.error(`[email] send failed (${opts.eventType})`, err)
  }
}
