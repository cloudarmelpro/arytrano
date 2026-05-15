'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { rateLimiters } from '@/lib/rate-limit'
import { auth } from '@/features/auth'
import {
  addListingPhoto,
  removeListingPhoto,
  reorderListingPhotos,
} from '../services/manage-photos'
import { listingIdSchema, listingPhotoIdSchema } from '../schemas'

export type PhotoActionState = { ok: boolean; message?: string; photoId?: string; url?: string }

async function requireUser(): Promise<
  { ok: true; userId: string } | { ok: false; error: PhotoActionState }
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

export async function uploadListingPhotoAction(
  listingId: string,
  _prev: PhotoActionState,
  formData: FormData,
): Promise<PhotoActionState> {
  const guard = await requireUser()
  if (!guard.ok) return guard.error

  let validListingId: string
  try {
    validListingId = listingIdSchema.parse(listingId)
  } catch {
    return { ok: false, message: 'ID listing invalide' }
  }

  const rl = await rateLimiters.photoUpload(guard.userId, validListingId)
  if (!rl.success) {
    return { ok: false, message: 'Trop d\'uploads. Réessaie dans une minute.' }
  }

  const file = formData.get('photo')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Choisis une photo' }
  }

  try {
    const photo = await addListingPhoto(guard.userId, validListingId, file)
    revalidatePath(`/dashboard/listings/${validListingId}/edit`)
    return { ok: true, message: 'Photo ajoutée.', photoId: photo.id, url: photo.url }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[upload-listing-photo]', err)
    return { ok: false, message: 'Échec de l\'upload — réessaie.' }
  }
}

export async function removeListingPhotoAction(
  listingId: string,
  photoId: string,
): Promise<PhotoActionState> {
  const guard = await requireUser()
  if (!guard.ok) return guard.error

  let validListingId: string
  let validPhotoId: string
  try {
    validListingId = listingIdSchema.parse(listingId)
    validPhotoId = listingPhotoIdSchema.parse(photoId)
  } catch {
    return { ok: false, message: 'ID invalide' }
  }

  try {
    await removeListingPhoto(guard.userId, validListingId, validPhotoId)
    revalidatePath(`/dashboard/listings/${validListingId}/edit`)
    return { ok: true, message: 'Photo retirée.' }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[remove-listing-photo]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}

export async function reorderListingPhotosAction(
  listingId: string,
  order: string[],
): Promise<PhotoActionState> {
  const guard = await requireUser()
  if (!guard.ok) return guard.error

  let validListingId: string
  try {
    validListingId = listingIdSchema.parse(listingId)
  } catch {
    return { ok: false, message: 'ID listing invalide' }
  }

  try {
    await reorderListingPhotos(guard.userId, validListingId, order)
    revalidatePath(`/dashboard/listings/${validListingId}/edit`)
    return { ok: true, message: 'Ordre mis à jour.' }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[reorder-listing-photos]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}
