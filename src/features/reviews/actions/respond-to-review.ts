'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { auth } from '@/features/auth'
import { respondToReviewSchema } from '../schemas/create-review'
import { respondToReview } from '../services/respond-to-review'

type RespondToReviewState = {
  ok: boolean
  message?: string
}

export async function respondToReviewAction(
  reviewId: string,
  body: string,
): Promise<RespondToReviewState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }

  let input
  try {
    input = respondToReviewSchema.parse({ reviewId, body })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Champs invalides' }
    }
    throw err
  }

  try {
    await respondToReview({ ownerId: session.user.id, data: input })
    revalidatePath('/[citySlug]/[neighborhoodSlug]/[listingSlug]', 'page')
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[respondToReviewAction]', err)
    return { ok: false, message: 'Impossible de publier la réponse.' }
  }
}
