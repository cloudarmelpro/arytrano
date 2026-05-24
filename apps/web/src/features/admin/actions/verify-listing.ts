'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { requireAdmin } from '../services/require-admin'
import {
  verifyListing,
  unverifyListing,
} from '../services/verify-listing'

type VerifyListingState = { ok: boolean; message?: string; verified?: boolean }

/**
 * Server Action wrapper around verifyListing / unverifyListing (T-033).
 * Web-only — the REST mirror would mount its own handler under
 * `features/admin/api/` calling the same services.
 */
export async function toggleListingVerifiedAction(
  listingId: string,
  action: 'verify' | 'unverify',
): Promise<VerifyListingState> {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }

  try {
    const result =
      action === 'verify'
        ? await verifyListing(admin.userId, listingId)
        : await unverifyListing(admin.userId, listingId)
    // The admin grid + public detail rely on this state for the badge.
    revalidatePath('/admin/listings')
    revalidatePath('/admin')
    revalidatePath('/annonces')
    return { ok: true, verified: result.nowVerified }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[toggleListingVerifiedAction]', err)
    return {
      ok: false,
      message:
        action === 'verify'
          ? "Impossible de vérifier l'annonce pour le moment."
          : "Impossible de retirer la vérification pour le moment.",
    }
  }
}
