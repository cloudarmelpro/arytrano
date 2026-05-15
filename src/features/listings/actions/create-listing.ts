'use server'

import { redirect } from 'next/navigation'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { rateLimiters } from '@/lib/rate-limit'
import { auth } from '@/features/auth'
import { createListing } from '../services/create-listing'
import { createListingSchema } from '../schemas'

export type CreateListingActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
  listingId?: string
}

export async function createListingAction(
  _prev: CreateListingActionState,
  formData: FormData,
): Promise<CreateListingActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }
  if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
    return { ok: false, message: 'Seuls les propriétaires peuvent créer une annonce' }
  }

  const rl = await rateLimiters.createListing(session.user.id)
  if (!rl.success) {
    return { ok: false, message: 'Trop de brouillons créés. Réessaie dans une heure.' }
  }

  let input
  try {
    input = createListingSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      type: formData.get('type'),
      priceMonthlyMGA: formData.get('priceMonthlyMGA'),
      cityId: formData.get('cityId'),
      neighborhoodId: formData.get('neighborhoodId'),
      surfaceM2: formData.get('surfaceM2') || undefined,
      bedrooms: formData.get('bedrooms') || undefined,
      bathrooms: formData.get('bathrooms') || undefined,
      furnished: formData.get('furnished') ?? false,
      // Multi-valued fields: collect every entry via getAll. Empty list = empty array.
      amenities: formData.getAll('amenities').filter((v): v is string => typeof v === 'string'),
      customAmenities: formData
        .getAll('customAmenities')
        .filter((v): v is string => typeof v === 'string'),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Champs invalides', fields: zodIssuesToFields(err) }
    }
    throw err
  }

  let listingId: string
  try {
    const listing = await createListing(session.user.id, input)
    listingId = listing.id
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[create-listing]', err)
    return { ok: false, message: 'Une erreur est survenue.' }
  }

  redirect(`/dashboard/listings/${listingId}/edit`)
}
