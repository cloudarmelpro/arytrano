import 'server-only'
import { prisma } from '@/lib/db'
import { sendPush, type PushMessage } from '@/lib/push/send-push'
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
}

export async function notifySavedSearchMatches(
  listing: ListingForFanout,
): Promise<void> {
  try {
    const candidates = await prisma.savedSearch.findMany({
      where: {
        alertsOn: true,
        user: { expoPushToken: { not: null } },
        // Don't push the listing's own owner — they obviously know
        // about it.
        userId: { not: listing.ownerId },
      },
      select: {
        id: true,
        filters: true,
        name: true,
        user: {
          select: { id: true, expoPushToken: true, locale: true },
        },
      },
    })

    // Dedupe : Map<userId, { token, locale, savedSearchName }> — first
    // matching saved-search wins (we use its name in the message body).
    const matchesByUser = new Map<
      string,
      { token: string; locale: 'FR_MG' | 'MG'; searchName: string }
    >()
    for (const candidate of candidates) {
      if (!candidate.user.expoPushToken) continue
      if (matchesByUser.has(candidate.user.id)) continue
      const parsed = savedSearchFiltersSchema.safeParse(candidate.filters)
      if (!parsed.success) continue
      if (!matchesSavedSearch(listing, parsed.data)) continue
      matchesByUser.set(candidate.user.id, {
        token: candidate.user.expoPushToken,
        locale: candidate.user.locale,
        searchName: candidate.name,
      })
    }

    if (matchesByUser.size === 0) return

    const messages: PushMessage[] = []
    for (const [, m] of matchesByUser) {
      const isMg = m.locale === 'MG'
      messages.push({
        to: m.token,
        title: isMg ? 'Filazana vaovao' : 'Nouvelle annonce',
        body: isMg
          ? `Misy filazana vaovao mifanaraka amin'ny "${m.searchName}".`
          : `Une nouvelle annonce correspond à « ${m.searchName} ».`,
        sound: 'default',
        data: {
          kind: 'savedSearchMatch',
          listingId: listing.id,
          listingSlug: listing.slug,
        },
      })
    }

    await sendPush(messages)
  } catch (err) {
    console.warn('[notifySavedSearchMatches] failed', err)
  }
}
