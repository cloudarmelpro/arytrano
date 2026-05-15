import 'server-only'
import type { ReactionKind } from '@prisma/client'
import { prisma } from '@/lib/db'

export type ReviewReactionSnapshot = {
  likes: number
  dislikes: number
  /** Current viewer's reaction, or null when none / not signed in. */
  mine: ReactionKind | null
}

/**
 * Bulk-load reaction stats for a list of review ids in TWO queries
 * regardless of list size (no N+1):
 *   1. `groupBy` over the reaction table → counts per (review, kind).
 *   2. Single `findMany` for the current user's reactions on those reviews.
 *
 * Returns a Map keyed by review id. Reviews with zero reactions still
 * receive a zeroed snapshot — the caller can `.get(id) ?? defaultZero`.
 */
export async function getReviewReactionsForList(
  reviewIds: string[],
  userId: string | null,
): Promise<Map<string, ReviewReactionSnapshot>> {
  if (reviewIds.length === 0) return new Map()

  const [counts, mine] = await Promise.all([
    prisma.reviewReaction.groupBy({
      by: ['reviewId', 'kind'],
      where: { reviewId: { in: reviewIds } },
      _count: { _all: true },
    }),
    userId
      ? prisma.reviewReaction.findMany({
          where: { userId, reviewId: { in: reviewIds } },
          select: { reviewId: true, kind: true },
        })
      : Promise.resolve([] as { reviewId: string; kind: ReactionKind }[]),
  ])

  const map = new Map<string, ReviewReactionSnapshot>()
  for (const id of reviewIds) {
    map.set(id, { likes: 0, dislikes: 0, mine: null })
  }
  for (const row of counts) {
    const snap = map.get(row.reviewId)
    if (!snap) continue
    if (row.kind === 'LIKE') snap.likes = row._count._all
    else if (row.kind === 'DISLIKE') snap.dislikes = row._count._all
  }
  for (const row of mine) {
    const snap = map.get(row.reviewId)
    if (snap) snap.mine = row.kind
  }
  return map
}
