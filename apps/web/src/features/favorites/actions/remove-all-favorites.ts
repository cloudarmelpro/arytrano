'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth'
import { removeAllFavorites } from '../services/remove-all-favorites'

type RemoveAllFavoritesResult =
  | { ok: true; removed: number }
  | { ok: false; needsAuth?: boolean; message?: string }

/**
 * Clear all of the current user's favorites in one shot. Used by the
 * "Retirer tous" button on /dashboard/favoris. Auth-gated.
 *
 * Per memory `feedback_server_action_authn_guard`, this Server Action
 * has side effects (DB writes) and MUST reject anonymous calls — the
 * `auth()` check below is the single source of truth.
 */
export async function removeAllFavoritesAction(): Promise<RemoveAllFavoritesResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, needsAuth: true }
  }

  try {
    const removed = await removeAllFavorites(session.user.id)
    revalidatePath('/dashboard/favoris')
    return { ok: true, removed }
  } catch {
    return { ok: false, message: 'Impossible de retirer les favoris.' }
  }
}
