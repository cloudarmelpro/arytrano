import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildOwnerWeeklyDigestEmail } from '@/lib/email/templates/owner-weekly-digest'
import {
  computeOwnerWeeklyDigest,
  listOwnersDueDigest,
} from '../queries/compute-owner-weekly-digest'

/**
 * OWN-04 — orchestrator invoked by the Monday 08:00 cron. Iterates
 * every eligible owner (leaseUpdatesEnabled + no emailDisabledAt +
 * has PUBLISHED listings), computes their digest, and fires the email
 * via the existing sendTransactionalEmail rate limiter.
 *
 * Failures per owner are captured but never rethrown — one bad row
 * shouldn't stop the fan-out.
 */
export type OwnerDigestResult = {
  scanned: number
  sent: number
  skipped: number
  failed: number
}

export async function sendOwnerWeeklyDigests(): Promise<OwnerDigestResult> {
  const baseUrl = env.AUTH_URL
  const owners = await listOwnersDueDigest()

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const ownerId of owners) {
    try {
      const payload = await computeOwnerWeeklyDigest(ownerId)
      if (!payload) {
        skipped += 1
        continue
      }
      // Skip owners with a stone-cold week — nothing meaningful to
      // report and the noise churns their inbox.
      if (
        payload.totals.contacts7d === 0 &&
        payload.totals.favorites7d === 0 &&
        payload.totals.views7d === 0 &&
        payload.totals.expiringSoon === 0
      ) {
        skipped += 1
        continue
      }

      const email = buildOwnerWeeklyDigestEmail(payload, baseUrl)
      await sendTransactionalEmail({
        recipientId: payload.ownerId,
        recipientEmail: payload.email,
        eventType: 'owner-weekly-digest',
        ...email,
      })
      sent += 1
    } catch (err) {
      failed += 1
      Sentry.captureException(err, {
        tags: { cron: 'owner-weekly-digest', step: 'per-owner' },
        extra: { ownerId },
      })
    }
  }

  return { scanned: owners.length, sent, skipped, failed }
}
