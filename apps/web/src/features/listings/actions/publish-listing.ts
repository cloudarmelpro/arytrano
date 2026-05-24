'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { auth } from '@/features/auth'
import { publishListing } from '../services/publish-listing'
import { toggleListingAvailability } from '../services/toggle-availability'
import { deleteListing } from '../services/delete-listing'
import { listingIdSchema } from '../schemas'

type ListingActionState = { ok: boolean; message?: string }

async function requireOwner(): Promise<
  { ok: true; userId: string } | { ok: false; error: ListingActionState }
> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: { ok: false, message: 'Non authentifié' } }
  }
  if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
    return { ok: false, error: { ok: false, message: 'Action réservée aux propriétaires' } }
  }
  return { ok: true, userId: session.user.id }
}

export async function publishListingAction(
  _prev: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const guard = await requireOwner()
  if (!guard.ok) return guard.error

  let listingId: string
  try {
    listingId = listingIdSchema.parse(formData.get('listingId'))
  } catch {
    return { ok: false, message: 'ID listing invalide' }
  }

  try {
    await publishListing(guard.userId, listingId)
    revalidatePath('/dashboard/listings')
    revalidatePath(`/dashboard/listings/${listingId}/edit`)
    return { ok: true, message: 'Annonce publiée.' }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[publish-listing]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}

export async function toggleAvailabilityAction(
  _prev: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const guard = await requireOwner()
  if (!guard.ok) return guard.error

  let listingId: string
  try {
    listingId = listingIdSchema.parse(formData.get('listingId'))
  } catch {
    return { ok: false, message: 'ID listing invalide' }
  }

  try {
    const listing = await toggleListingAvailability(guard.userId, listingId)
    revalidatePath('/dashboard/listings')
    revalidatePath(`/dashboard/listings/${listingId}/edit`)
    return {
      ok: true,
      message: listing.status === 'PUBLISHED'
        ? 'Annonce remise en ligne.'
        : 'Annonce marquée comme indisponible.',
    }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[toggle-availability]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}

export async function deleteListingAction(
  _prev: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const guard = await requireOwner()
  if (!guard.ok) return guard.error

  let listingId: string
  try {
    listingId = listingIdSchema.parse(formData.get('listingId'))
  } catch {
    return { ok: false, message: 'ID listing invalide' }
  }

  try {
    await deleteListing(guard.userId, listingId)
    revalidatePath('/dashboard/listings')
    return { ok: true, message: 'Annonce supprimée.' }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[delete-listing]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}
