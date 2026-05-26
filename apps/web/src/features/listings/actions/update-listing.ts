'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { auth } from '@/features/auth'
import { updateListing } from '../services/update-listing'
import { updateListingSchema, listingIdSchema } from '../schemas'

type UpdateListingActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

export async function updateListingAction(
  listingId: string,
  _prev: UpdateListingActionState,
  formData: FormData,
): Promise<UpdateListingActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }
  if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
    return { ok: false, message: 'Action réservée aux propriétaires' }
  }

  let validId: string
  try {
    validId = listingIdSchema.parse(listingId)
  } catch {
    return { ok: false, message: 'ID listing invalide' }
  }

  // Build a partial object from FormData; only include keys that were sent.
  const raw: Record<string, FormDataEntryValue | FormDataEntryValue[] | undefined> = {}
  for (const key of [
    'title', 'description', 'type', 'priceMonthlyMGA', 'cautionMonths',
    'cityId', 'neighborhoodId', 'surfaceM2', 'bedrooms', 'bathrooms', 'furnished',
  ] as const) {
    const v = formData.get(key)
    if (v !== null && v !== '') raw[key] = v
  }
  // Array fields use `getAll`. The `amenitiesSent` sentinel lets us tell
  // "owner submitted an empty list (clear everything)" from "field absent
  // (don't touch)" — without it, an unchecked-all save would no-op.
  if (formData.has('amenitiesSent')) {
    raw.amenities = formData.getAll('amenities').filter((v): v is string => typeof v === 'string')
    raw.customAmenities = formData
      .getAll('customAmenities')
      .filter((v): v is string => typeof v === 'string')
  }

  let input
  try {
    input = updateListingSchema.parse(raw)
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Champs invalides', fields: zodIssuesToFields(err) }
    }
    throw err
  }

  try {
    await updateListing(session.user.id, validId, input)
    revalidatePath(`/dashboard/listings/${validId}/edit`)
    revalidatePath('/dashboard/listings')
    return { ok: true, message: 'Annonce mise à jour.' }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[update-listing]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }
}
