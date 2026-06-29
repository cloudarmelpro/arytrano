'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import { suspendListing } from '../services/suspend-listing'
import { suspendListingSchema } from '../schemas/suspend-listing'
import { requireAdmin } from '../services/require-admin'

type SuspendListingActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

export async function suspendListingAction(
  _prev: SuspendListingActionState,
  formData: FormData,
): Promise<SuspendListingActionState> {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }

  let input
  try {
    input = suspendListingSchema.parse({
      listingId: formData.get('listingId'),
      reason: formData.get('reason'),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Paramètres invalides', fields: zodIssuesToFields(err) }
    }
    throw err
  }

  try {
    await suspendListing(admin.userId, input)
    void writeAuditLog({
      adminId: admin.userId,
      action: 'listing.suspend',
      targetType: 'Listing',
      targetId: input.listingId,
      metadata: { reason: input.reason.slice(0, 200) },
    })
    revalidatePath('/admin/listings')
    revalidatePath('/admin')
    return { ok: true, message: 'Annonce suspendue. Le propriétaire est notifié par email.' }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[suspendListingAction]', err)
    return { ok: false, message: 'Impossible de suspendre l\'annonce pour le moment.' }
  }
}
