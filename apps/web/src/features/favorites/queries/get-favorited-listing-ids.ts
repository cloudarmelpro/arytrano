import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Return the SET of listing ids the user has favorited among a provided
 * candidate list. Used by the public listings grid / detail to render the
 * heart button in its filled state without one query per card.
 *
 * If `candidates` is empty, returns an empty set with zero DB cost.
 * If `userId` is null (anonymous visitor), returns an empty set — heart
 * buttons render in their default (unfilled) state and a click will
 * redirect to sign-in.
 */
export async function getFavoritedListingIds(
  userId: string | null,
  candidates: string[],
): Promise<Set<string>> {
  if (!userId || candidates.length === 0) return new Set()
  const rows = await prisma.favorite.findMany({
    where: { userId, listingId: { in: candidates } },
    select: { listingId: true },
  })
  return new Set(rows.map((r) => r.listingId))
}
