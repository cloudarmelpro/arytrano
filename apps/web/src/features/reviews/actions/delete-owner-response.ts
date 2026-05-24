'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { auth } from '@/features/auth'
import { deleteReviewSchema } from '../schemas/create-review'
import { deleteOwnerResponse } from '../services/delete-owner-response'

type DeleteOwnerResponseState = {
  ok: boolean
  message?: string
}

export async function deleteOwnerResponseAction(
  reviewId: string,
): Promise<DeleteOwnerResponseState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }

  let input
  try {
    // The reviewId schema is the same shape we already use for deleting
    // a review — both endpoints take just an id.
    input = deleteReviewSchema.parse({ reviewId })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Identifiant invalide' }
    }
    throw err
  }

  try {
    await deleteOwnerResponse({ ownerId: session.user.id, reviewId: input.reviewId })
    revalidatePath('/[citySlug]/[neighborhoodSlug]/[listingSlug]', 'page')
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[deleteOwnerResponseAction]', err)
    return { ok: false, message: 'Impossible de supprimer la réponse.' }
  }
}
