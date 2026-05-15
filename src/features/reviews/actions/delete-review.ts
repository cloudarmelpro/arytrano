'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { auth } from '@/features/auth'
import { deleteReviewSchema } from '../schemas/create-review'
import { deleteReview } from '../services/delete-review'

export type DeleteReviewState = {
  ok: boolean
  message?: string
}

export async function deleteReviewAction(
  reviewId: string,
): Promise<DeleteReviewState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }

  let input
  try {
    input = deleteReviewSchema.parse({ reviewId })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Identifiant invalide' }
    }
    throw err
  }

  try {
    await deleteReview({ authorId: session.user.id, reviewId: input.reviewId })
    revalidatePath('/[citySlug]/[neighborhoodSlug]/[listingSlug]', 'page')
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[deleteReviewAction]', err)
    return { ok: false, message: 'Impossible de supprimer l\'avis.' }
  }
}
