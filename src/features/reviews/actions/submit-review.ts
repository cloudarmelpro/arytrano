'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { auth } from '@/features/auth'
import { createReviewSchema } from '../schemas/create-review'
import { createReview } from '../services/create-review'

export type SubmitReviewState = {
  ok: boolean
  message?: string
  needsAuth?: boolean
}

/**
 * Visitor submits a review for a listing. Auth-gated — anonymous
 * visitors get `needsAuth: true` and the client redirects to sign-in.
 */
export async function submitReviewAction(
  listingId: string,
  rating: number,
  body: string,
): Promise<SubmitReviewState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, needsAuth: true }

  let input
  try {
    input = createReviewSchema.parse({ listingId, rating, body })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Champs invalides' }
    }
    throw err
  }

  try {
    await createReview({ authorId: session.user.id, data: input })
    // The listing detail page is rendered by `/[city]/[neighborhood]/[slug]`;
    // we don't know the exact path here without an extra query. The
    // simplest reliable invalidation: tag the listing — for now we trust
    // the client to refresh after success (returning to the page sets the
    // SSR cache anyway since the route is dynamic).
    revalidatePath('/[citySlug]/[neighborhoodSlug]/[listingSlug]', 'page')
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[submitReviewAction]', err)
    return { ok: false, message: 'Impossible de publier l\'avis pour le moment.' }
  }
}
