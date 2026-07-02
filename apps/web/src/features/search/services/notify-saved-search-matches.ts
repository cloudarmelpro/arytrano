import 'server-only'
import { prisma } from '@/lib/db'
import { sendPush, type PushMessage } from '@/lib/push/send-push'
import { recordTickets } from '@/lib/push/receipts'
import { env } from '@/lib/env'
import { formatAriary } from '@/lib/format/currency'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { sanitizeEmailHeaderValue } from '@/lib/email/sanitize-header'
import { buildSavedSearchMatchEmail } from '@/lib/email/templates/saved-search-match'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { savedSearchFiltersSchema } from '../schemas/saved-search'
import {
  matchesSavedSearch,
  type ListingForMatching,
} from './match-listing'

/**
 * Fan out a push notification to every saved-search subscriber whose
 * filters match the just-published listing.
 *
 * Called fire-and-forget from `publish-listing.ts` after the publish
 * succeeds — never blocks the owner's primary action. All errors are
 * swallowed.
 *
 * Flow :
 *   1. Load every active saved search with alertsOn=true, joining the
 *      owner's expoPushToken. Filter out rows where the token is null
 *      (user never installed the app — no point matching).
 *   2. For each row, parse the JSON `filters` column via the canonical
 *      Zod schema. Malformed rows drop silently (forward-compat with
 *      filter-shape migrations).
 *   3. Evaluate `matchesSavedSearch` against the listing.
 *   4. Dedupe by userId — a single user with N matching saved searches
 *      should get ONE push, not N (otherwise we'd be spamming them).
 *   5. Build PushMessage[] and batch via `sendPush`.
 *
 * Volume sanity : at launch we expect ~50-200 saved searches total.
 * Loading every row + JS-matching is fine. When we cross ~1000 saved
 * searches we'd want a SQL-driven WHERE on the listing's known
 * properties to reduce the in-memory set first.
 */

export type ListingForFanout = ListingForMatching & {
  id: string
  slug: string
  ownerId: string
  // Localized labels used by the email fallback. NOT used by push (which
  // sends a deliberately generic body to avoid leaking targeting info on
  // the lock screen — see Security P1-2 note below).
  cityNameFr: string
  cityNameMg: string
  neighborhoodNameFr: string
  neighborhoodNameMg: string
}

/**
 * Fan out alerts (push OR email) to every saved-search subscriber whose
 * filters match the just-published listing.
 *
 * E-T09 — split delivery channel by `user.expoPushToken`:
 *   - user has push token  → Expo push (existing behaviour)
 *   - user has NO push token (web-only) → transactional email fallback
 *
 * Push and email never both fire for the same user — push wins when
 * available. Email is per-user rate-limited (10/h via
 * sendTransactionalEmail), the same bucket all other transactional
 * mails share.
 *
 * One subscriber with N matching saved searches still gets ONE
 * notification (dedupe by userId, first match wins).
 */
export async function notifySavedSearchMatches(
  listing: ListingForFanout,
): Promise<void> {
  try {
    const candidates = await prisma.savedSearch.findMany({
      where: {
        alertsOn: true,
        // Don't notify the listing's own owner — they obviously know
        // about it.
        userId: { not: listing.ownerId },
      },
      select: {
        id: true,
        filters: true,
        name: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            expoPushToken: true,
            locale: true,
          },
        },
      },
    })

    type Match = {
      userId: string
      email: string
      displayName: string
      expoPushToken: string | null
      locale: 'FR_MG' | 'MG'
      searchName: string
    }
    const matchesByUser = new Map<string, Match>()
    for (const candidate of candidates) {
      if (matchesByUser.has(candidate.user.id)) continue
      const parsed = savedSearchFiltersSchema.safeParse(candidate.filters)
      if (!parsed.success) continue
      if (!matchesSavedSearch(listing, parsed.data)) continue
      matchesByUser.set(candidate.user.id, {
        userId: candidate.user.id,
        email: candidate.user.email,
        displayName: candidate.user.name ?? 'locataire',
        expoPushToken: candidate.user.expoPushToken,
        locale: candidate.user.locale,
        searchName: candidate.name,
      })
    }

    if (matchesByUser.size === 0) return

    // Split by delivery channel.
    const pushMatches: Match[] = []
    const emailMatches: Match[] = []
    for (const m of matchesByUser.values()) {
      if (m.expoPushToken) pushMatches.push(m)
      else emailMatches.push(m)
    }

    // --- Push channel (existing) -----------------------------------
    if (pushMatches.length > 0) {
      const messages: PushMessage[] = []
      // Reverse index : token → userId, for mapping the per-recipient
      // tickets Expo returns back to a userId.
      const userByToken = new Map<string, string>()
      for (const m of pushMatches) {
        if (!m.expoPushToken) continue
        userByToken.set(m.expoPushToken, m.userId)
        const isMg = m.locale === 'MG'
        // Security P1-2 : strip `searchName` from the body — saved-
        // search names are user-written strings that may contain
        // private hints (neighborhood, budget, etc.). The body travels
        // through Expo's infra logs AND surfaces on the lock screen.
        messages.push({
          to: m.expoPushToken,
          title: isMg ? 'Filazana vaovao' : 'Nouvelle annonce',
          body: isMg
            ? 'Misy filazana vaovao mifanaraka amin\'ny fitadiavanao.'
            : 'Une nouvelle annonce correspond à ta recherche.',
          sound: 'default',
          data: {
            kind: 'savedSearchMatch',
            listingId: listing.id,
            listingSlug: listing.slug,
          },
        })
      }
      const result = await sendPush(messages)
      await recordTickets(
        result.tickets.flatMap((t) => {
          const userId = userByToken.get(t.to)
          return userId ? [{ userId, ticketId: t.ticketId }] : []
        }),
      )
    }

    // --- Web push channel (TEN-14) ---------------------------------
    // Independent of Expo: browsers get pinged via VAPID web-push
    // regardless of whether the user has a mobile app installed.
    // Fire-and-forget per recipient so a failing push doesn't stop
    // the fan-out.
    {
      const { sendPushToUser } = await import('@/lib/push/web-push')
      for (const m of matchesByUser.values()) {
        void sendPushToUser(m.userId, {
          title: m.locale === 'MG' ? 'Filazana vaovao' : 'Nouvelle annonce',
          body:
            m.locale === 'MG'
              ? 'Misy filazana vaovao mifanaraka amin\'ny fitadiavanao.'
              : 'Une nouvelle annonce correspond à ta recherche.',
          url: `/annonces?utm_source=push&utm_medium=web&utm_campaign=saved-search`,
          tag: `saved-search-${listing.id}`,
        })
      }
    }

    // --- Email channel (E-T09 fallback) ----------------------------
    if (emailMatches.length > 0) {
      const baseUrl = env.AUTH_URL.replace(/\/$/, '')
      // Sanitize once — caller passes the raw listing title from DB.
      // Memory `feedback_email_header_injection`: never let raw user
      // strings flow into a Subject header without CRLF stripping.
      const safeTitle = sanitizeEmailHeaderValue(listing.title)
      const listingUrl = `${baseUrl}/annonces/${listing.slug}`
      const manageSearchUrl = `${baseUrl}/dashboard/saved-searches`

      for (const m of emailMatches) {
        const isMg = m.locale === 'MG'
        const locationLabel = isMg
          ? listing.neighborhoodNameMg
          : listing.neighborhoodNameFr
        const built = buildSavedSearchMatchEmail(
          fromPrismaLocale(m.locale),
          {
            recipientName: sanitizeEmailHeaderValue(m.displayName),
            listingTitle: safeTitle,
            locationLabel,
            monthlyRentFormatted: formatAriary(listing.priceMonthlyMGA),
            listingUrl,
            manageSearchUrl,
          },
        )
        // Fire-and-forget; sendTransactionalEmail is fail-soft.
        void sendTransactionalEmail({
          recipientId: m.userId,
          recipientEmail: m.email,
          eventType: 'saved-search-match',
          subject: built.subject,
          html: built.html,
          text: built.text,
        })
      }
    }
  } catch (err) {
    // Sec P1-5 : log only the message — Prisma errors include
    // bound query values which can leak userId.
    console.warn(
      '[notifySavedSearchMatches] failed',
      err instanceof Error ? err.message : String(err),
    )
  }
}
