'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import { requireAdmin } from '../services/require-admin'
import {
  bulkModerateListings,
  type BulkAction,
} from '../services/bulk-moderate-listings'

const ALLOWED_ACTIONS: ReadonlyArray<BulkAction> = [
  'verify',
  'unverify',
  'suspend',
]

export type BulkModerateActionState = {
  ok: boolean
  message?: string
  processed?: number
  succeeded?: number
  failed?: number
}

export async function bulkModerateListingsAction(
  _prev: BulkModerateActionState,
  formData: FormData,
): Promise<BulkModerateActionState> {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }

  const rawIds = String(formData.get('listingIds') ?? '')
  const action = String(formData.get('action') ?? '') as BulkAction
  const reason = String(formData.get('reason') ?? '')

  if (!ALLOWED_ACTIONS.includes(action)) {
    return { ok: false, message: 'Action inconnue.' }
  }
  const listingIds = rawIds
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (listingIds.length === 0) {
    return { ok: false, message: 'Aucune annonce sélectionnée.' }
  }
  if (action === 'suspend' && reason.trim().length < 4) {
    return { ok: false, message: 'Motif requis (4 caractères min).' }
  }

  const result = await bulkModerateListings({
    adminId: admin.userId,
    listingIds,
    action,
    reason: action === 'suspend' ? reason : undefined,
  })

  void writeAuditLog({
    adminId: admin.userId,
    action: `listing.bulk.${action}`,
    targetType: 'ListingBatch',
    targetId: `${Date.now()}`,
    metadata: {
      count: listingIds.length,
      succeeded: result.succeeded,
      failed: result.failed,
    },
  })

  revalidatePath('/admin/listings')
  return { ok: true, ...result }
}
