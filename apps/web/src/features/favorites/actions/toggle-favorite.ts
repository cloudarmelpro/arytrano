'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { auth } from '@/features/auth'
import { toggleFavoriteSchema } from '../schemas/toggle-favorite'
import { toggleFavorite } from '../services/toggle-favorite'

type ToggleFavoriteState = {
  ok: boolean
  /** New state after the toggle (only set when `ok` is true). */
  favorited?: boolean
  message?: string
  /** Caller can redirect to sign-in when this is true. */
  needsAuth?: boolean
}

/**
 * Toggle the current visitor's favorite for a listing.
 * Anonymous visitors get `{ ok: false, needsAuth: true }` — the client
 * redirects them to `/sign-in?returnTo=...`.
 */
export async function toggleFavoriteAction(
  listingId: string,
): Promise<ToggleFavoriteState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, needsAuth: true }
  }

  let input
  try {
    input = toggleFavoriteSchema.parse({ listingId })
  } catch (err) {
    if (err instanceof ZodError) return { ok: false, message: 'Identifiant invalide' }
    throw err
  }

  try {
    const result = await toggleFavorite({ userId: session.user.id, listingId: input.listingId })
    // Only revalidate the favorites dashboard — the public grid doesn't
    // need a server round-trip; the client toggles its own visual state.
    revalidatePath('/dashboard/favoris')
    return { ok: true, favorited: result.favorited }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[toggleFavoriteAction]', err)
    return { ok: false, message: 'Impossible de mettre à jour le favori.' }
  }
}
