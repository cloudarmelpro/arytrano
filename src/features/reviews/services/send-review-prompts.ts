import 'server-only'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildReviewPromptEmail } from '@/lib/email/templates/review-prompt'
import { findReviewPromptCandidates } from './find-review-prompt-candidates'

export type SendReviewPromptsResult = {
  candidates: number
  emailed: number
  failed: number
}

/**
 * Orchestrator for the daily review-prompt cron (T-050).
 *
 * Reads up to N candidates from `find-review-prompt-candidates`, sends
 * each one a localized email via `sendTransactionalEmail`, then marks
 * the ContactEvent so it never gets re-prompted (even if delivery
 * later fails downstream — we treat "we tried" as enough).
 *
 * The fail-soft email helper (`sendTransactionalEmail`) swallows
 * SMTP errors so a single bad address won't break the loop. Counts
 * are returned for observability.
 */
export async function sendReviewPrompts(
  limit = 100,
): Promise<SendReviewPromptsResult> {
  const candidates = await findReviewPromptCandidates(limit)
  if (candidates.length === 0) {
    return { candidates: 0, emailed: 0, failed: 0 }
  }

  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  let emailed = 0
  let failed = 0

  for (const c of candidates) {
    try {
      const email = buildReviewPromptEmail(fromPrismaLocale(c.viewerLocale), {
        recipientName: c.viewerName ?? 'Étudiant',
        listingTitle: c.listingTitle,
        listingUrl: `${baseUrl}/${c.citySlug}/${c.neighborhoodSlug}/${c.listingSlug}#review`,
      })
      await sendTransactionalEmail({
        recipientId: c.viewerId,
        recipientEmail: c.viewerEmail,
        eventType: 'review-prompt',
        ...email,
      })
      // Mark prompted regardless of send outcome — we don't want to
      // retry forever if the address bounces (sendTransactionalEmail
      // already silently logs SMTP errors).
      await prisma.contactEvent.update({
        where: { id: c.contactEventId },
        data: { reviewPromptSentAt: new Date() },
      })
      emailed++
    } catch {
      failed++
    }
  }

  return { candidates: candidates.length, emailed, failed }
}
