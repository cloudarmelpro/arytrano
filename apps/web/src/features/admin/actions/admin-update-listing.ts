'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import { requireAdmin } from '../services/require-admin'
import { adminUpdateListing } from '@/features/listings/services/update-listing'
import { updateListingSchema } from '@/features/listings/schemas'

export type AdminUpdateListingState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

export async function adminUpdateListingAction(
  listingId: string,
  _prev: AdminUpdateListingState,
  formData: FormData,
): Promise<AdminUpdateListingState> {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }

  let input
  try {
    input = updateListingSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      type: formData.get('type') ?? undefined,
      priceMonthlyMGA: Number(formData.get('priceMonthlyMGA')),
      cautionMonths: formData.get('cautionMonths') ? Number(formData.get('cautionMonths')) : undefined,
      cityId: formData.get('cityId'),
      neighborhoodId: formData.get('neighborhoodId'),
      surfaceM2: formData.get('surfaceM2') ? Number(formData.get('surfaceM2')) : undefined,
      bedrooms: formData.get('bedrooms') ? Number(formData.get('bedrooms')) : undefined,
      bathrooms: formData.get('bathrooms') ? Number(formData.get('bathrooms')) : undefined,
      furnished: formData.get('furnished') === 'true',
      amenities: formData.get('amenitiesSent') === '1' ? formData.getAll('amenities') : undefined,
      customAmenities: formData.get('amenitiesSent') === '1' ? formData.getAll('customAmenities') : undefined,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      const fields: Record<string, string[]> = {}
      for (const issue of err.issues) {
        const key = issue.path[0]?.toString() ?? '_form'
        fields[key] ??= []
        fields[key]?.push(issue.message)
      }
      return { ok: false, message: 'Champs invalides', fields }
    }
    throw err
  }

  try {
    await adminUpdateListing(admin.userId, listingId, input)
    void writeAuditLog({
      adminId: admin.userId,
      action: 'listing.admin-edit',
      targetType: 'Listing',
      targetId: listingId,
      metadata: {
        fields: Object.keys(input).filter((k) => (input as Record<string, unknown>)[k] !== undefined),
      },
    })
    revalidatePath(`/admin/listings/${listingId}`)
    revalidatePath('/admin/listings')
    return { ok: true, message: 'Annonce mise à jour.' }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }
}
