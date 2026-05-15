import 'server-only'
import type { ReactionKind } from '@prisma/client'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

export type ReactionState = {
  /** The current user's reaction after the toggle (or null = none). */
  mine: ReactionKind | null
  likes: number
  dislikes: number
}

/**
 * Toggle a user's reaction on a review.
 *
 * Semantics (Facebook-style):
 *  - `kind === null` → remove the existing reaction (no-op if none).
 *  - `kind === 'LIKE'` or `'DISLIKE'`:
 *      • no existing → create
 *      • same kind already → remove (toggle off)
 *      • different kind → switch (single row UPDATE)
 *
 * 404 if the review doesn't exist or isn't PUBLISHED — avoids leaking
 * existence to a probing client.
 */
export async function reactToReview(input: {
  userId: string
  reviewId: string
  kind: ReactionKind | null
}): Promise<ReactionState> {
  const review = await prisma.review.findFirst({
    where: { id: input.reviewId, status: 'PUBLISHED' },
    select: { id: true },
  })
  if (!review) throw errors.notFound('Avis introuvable')

  const existing = await prisma.reviewReaction.findUnique({
    where: { reviewId_userId: { reviewId: review.id, userId: input.userId } },
    select: { kind: true },
  })

  if (input.kind === null) {
    if (existing) {
      await prisma.reviewReaction.delete({
        where: { reviewId_userId: { reviewId: review.id, userId: input.userId } },
      })
    }
  } else if (!existing) {
    await prisma.reviewReaction.create({
      data: { reviewId: review.id, userId: input.userId, kind: input.kind },
    })
  } else if (existing.kind === input.kind) {
    // Clicking the same button twice = toggle off.
    await prisma.reviewReaction.delete({
      where: { reviewId_userId: { reviewId: review.id, userId: input.userId } },
    })
  } else {
    await prisma.reviewReaction.update({
      where: { reviewId_userId: { reviewId: review.id, userId: input.userId } },
      data: { kind: input.kind },
    })
  }

  // Fresh counts after the mutation — one round-trip to keep the client
  // perfectly in sync (cheaper than running two countQueries on every call).
  const [likes, dislikes, mine] = await Promise.all([
    prisma.reviewReaction.count({ where: { reviewId: review.id, kind: 'LIKE' } }),
    prisma.reviewReaction.count({ where: { reviewId: review.id, kind: 'DISLIKE' } }),
    prisma.reviewReaction.findUnique({
      where: { reviewId_userId: { reviewId: review.id, userId: input.userId } },
      select: { kind: true },
    }),
  ])

  return { likes, dislikes, mine: mine?.kind ?? null }
}
