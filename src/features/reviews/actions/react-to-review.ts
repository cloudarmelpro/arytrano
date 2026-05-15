'use server'

import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { auth } from '@/features/auth'
import { reactToReviewSchema } from '../schemas/react-review'
import { reactToReview, type ReactionState } from '../services/react-to-review'

export type ReactToReviewActionState = {
  ok: boolean
  /** Snapshot after the toggle — client uses it to update its UI in place. */
  state?: ReactionState
  message?: string
  needsAuth?: boolean
}

export async function reactToReviewAction(
  reviewId: string,
  kind: 'LIKE' | 'DISLIKE' | null,
): Promise<ReactToReviewActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, needsAuth: true }

  let input
  try {
    input = reactToReviewSchema.parse({ reviewId, kind })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Paramètres invalides' }
    }
    throw err
  }

  try {
    const state = await reactToReview({
      userId: session.user.id,
      reviewId: input.reviewId,
      kind: input.kind,
    })
    // No revalidatePath: the client updates the buttons + counts from the
    // returned state. Other tabs / users see fresh counts on next render.
    return { ok: true, state }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[reactToReviewAction]', err)
    return { ok: false, message: 'Action impossible. Réessaie.' }
  }
}
