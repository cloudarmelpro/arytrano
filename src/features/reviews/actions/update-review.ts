'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { auth } from '@/features/auth'
import { updateReviewSchema } from '../schemas/create-review'
import { updateReview } from '../services/update-review'

export type UpdateReviewState = {
  ok: boolean
  message?: string
}

export async function updateReviewAction(
  reviewId: string,
  rating: number,
  body: string,
): Promise<UpdateReviewState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }

  let input
  try {
    input = updateReviewSchema.parse({ reviewId, rating, body })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Champs invalides' }
    }
    throw err
  }

  try {
    await updateReview({ authorId: session.user.id, data: input })
    revalidatePath('/[citySlug]/[neighborhoodSlug]/[listingSlug]', 'page')
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[updateReviewAction]', err)
    return { ok: false, message: 'Impossible de mettre à jour l\'avis.' }
  }
}
