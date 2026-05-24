'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { auth } from '@/features/auth'
import { extendListingExpiration } from '../services/extend-listing-expiration'

type ActionResult =
  | { ok: true; expiresAt: string; statusChanged: boolean }
  | { ok: false; needsAuth?: boolean; message?: string }

/**
 * Owner clicks "Prolonger" on /dashboard/listings. Resets the TTL +
 * clears the alert flag. Guards: auth() + service-level ownerId
 * filter (defense-in-depth).
 */
export async function extendListingExpirationAction(
  listingId: string,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, needsAuth: true }

  try {
    const { expiresAt, statusChanged } = await extendListingExpiration(
      session.user.id,
      listingId,
    )
    revalidatePath('/dashboard/listings')
    revalidatePath(`/dashboard/listings/${listingId}/edit`)
    return {
      ok: true,
      expiresAt: expiresAt.toISOString(),
      statusChanged,
    }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    return { ok: false, message: 'Impossible de prolonger l\'annonce.' }
  }
}
