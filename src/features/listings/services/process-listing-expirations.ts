import 'server-only'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildListingExpiringEmail } from '@/lib/email/templates/listing-expiring'
import { buildListingExpiredEmail } from '@/lib/email/templates/listing-expired'

const WARNING_WINDOW_DAYS = 7
const WARNING_WINDOW_MS = WARNING_WINDOW_DAYS * 24 * 60 * 60 * 1000

export type ProcessExpirationsResult = {
  warned: number
  expired: number
  failed: number
}

/**
 * Daily orchestrator for the listing-expiration cron (T-049).
 *
 * Runs two passes in order :
 *
 *   1. **Warning** : PUBLISHED listings whose `expiresAt` falls inside
 *      the next 7 days AND haven't been warned yet. Email the owner
 *      with the "Prolonger" CTA, then stamp `expirationAlertSentAt` so
 *      the next day's run doesn't re-spam them.
 *
 *   2. **Expire** : PUBLISHED listings whose `expiresAt` is in the
 *      past. Flip status to UNAVAILABLE (preserves data + URL — the
 *      public route 308-redirects UNAVAILABLE listings to /annonces),
 *      then email the owner. Re-publishing later restarts the cycle.
 *
 * Idempotent. If the cron misses a day, the next run picks up both
 * cohorts. Email sends are fail-soft (`sendTransactionalEmail`
 * swallows SMTP errors) — a single bounce never blocks the rest of
 * the batch.
 *
 * Returns counts for the route handler to surface via Sentry / log.
 */
export async function processListingExpirations(): Promise<ProcessExpirationsResult> {
  const now = new Date()
  const warningCutoff = new Date(now.getTime() + WARNING_WINDOW_MS)
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const dashboardUrl = `${baseUrl}/dashboard/listings`

  let warned = 0
  let expired = 0
  let failed = 0

  // ─── Pass 1 : 7-day warning ─────────────────────────────────────
  const expiringSoon = await prisma.listing.findMany({
    where: {
      status: 'PUBLISHED',
      expiresAt: { not: null, gte: now, lte: warningCutoff },
      expirationAlertSentAt: null,
    },
    select: {
      id: true,
      title: true,
      expiresAt: true,
      owner: { select: { id: true, email: true, name: true, locale: true } },
    },
  })

  for (const listing of expiringSoon) {
    try {
      if (!listing.expiresAt) continue // type-narrow; the WHERE already filters this
      const daysLeft = Math.max(
        1,
        Math.ceil((listing.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
      )
      const email = buildListingExpiringEmail(
        fromPrismaLocale(listing.owner.locale),
        {
          recipientName: listing.owner.name ?? 'Propriétaire',
          listingTitle: listing.title,
          daysLeft,
          dashboardUrl,
        },
      )
      await sendTransactionalEmail({
        recipientId: listing.owner.id,
        recipientEmail: listing.owner.email,
        eventType: 'listing-expiring',
        ...email,
      })
      await prisma.listing.update({
        where: { id: listing.id },
        data: { expirationAlertSentAt: now },
      })
      warned++
    } catch {
      failed++
    }
  }

  // ─── Pass 2 : auto-expire ───────────────────────────────────────
  const expiredListings = await prisma.listing.findMany({
    where: {
      status: 'PUBLISHED',
      expiresAt: { not: null, lt: now },
    },
    select: {
      id: true,
      title: true,
      owner: { select: { id: true, email: true, name: true, locale: true } },
    },
  })

  for (const listing of expiredListings) {
    try {
      // Status flip first — the email is informational, the data
      // transition is the load-bearing change. If the email fails we
      // don't want to re-flip on the next cron run.
      await prisma.listing.update({
        where: { id: listing.id },
        data: { status: 'UNAVAILABLE' },
      })
      const email = buildListingExpiredEmail(
        fromPrismaLocale(listing.owner.locale),
        {
          recipientName: listing.owner.name ?? 'Propriétaire',
          listingTitle: listing.title,
          dashboardUrl,
        },
      )
      await sendTransactionalEmail({
        recipientId: listing.owner.id,
        recipientEmail: listing.owner.email,
        eventType: 'listing-expired',
        ...email,
      })
      expired++
    } catch {
      failed++
    }
  }

  return { warned, expired, failed }
}
