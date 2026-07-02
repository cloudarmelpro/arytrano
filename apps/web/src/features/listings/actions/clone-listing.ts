'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { auth } from '@/features/auth'
import { cloneListing } from '../services/clone-listing'

export type CloneListingState = { ok: boolean; message?: string; newId?: string }

/**
 * OWN-06 — one-click clone. Redirects the owner straight into the
 * edit form of the new draft so they can adjust title / photos and
 * publish.
 */
export async function cloneListingAction(
  sourceListingId: string,
): Promise<CloneListingState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Authentification requise' }
  try {
    const { newListingId } = await cloneListing(session.user.id, sourceListingId)
    revalidatePath('/dashboard/listings')
    redirect(`/dashboard/listings/${newListingId}/edit`)
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    // Re-throw NEXT_REDIRECT so Next handles the redirect properly.
    throw err
  }
}
