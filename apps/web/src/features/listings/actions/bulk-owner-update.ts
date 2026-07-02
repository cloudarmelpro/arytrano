'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { auth } from '@/features/auth'
import {
  bulkOwnerUpdateListings,
  type BulkOwnerAction,
} from '../services/bulk-owner-update'

export type BulkOwnerActionState = {
  ok: boolean
  message?: string
  scanned?: number
  succeeded?: number
  failed?: number
}

const ALLOWED_REASONS = new Set([
  'RENTED_VIA_ARYTRANO',
  'RENTED_OFF_PLATFORM',
  'TAKING_A_BREAK',
  'OTHER',
])

export async function bulkOwnerUpdateAction(
  _prev: BulkOwnerActionState,
  formData: FormData,
): Promise<BulkOwnerActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Authentification requise.' }

  const ids = String(formData.get('listingIds') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (ids.length === 0) return { ok: false, message: 'Aucune annonce sélectionnée.' }

  const kind = String(formData.get('kind') ?? '')
  let action: BulkOwnerAction
  if (kind === 'price-delta') {
    const percent = Number(formData.get('percent') ?? '0')
    if (!Number.isFinite(percent) || percent < -50 || percent > 50) {
      return { ok: false, message: 'Variation invalide (-50%…+50%).' }
    }
    action = { kind: 'price-delta', percent }
  } else if (kind === 'set-unavailable') {
    const reason = String(formData.get('reason') ?? '')
    if (!ALLOWED_REASONS.has(reason)) {
      return { ok: false, message: 'Raison invalide.' }
    }
    action = { kind: 'set-unavailable', reason: reason as BulkOwnerAction extends { kind: 'set-unavailable' } ? BulkOwnerAction['reason'] : never }
  } else if (kind === 'republish') {
    action = { kind: 'republish' }
  } else {
    return { ok: false, message: 'Action inconnue.' }
  }

  try {
    const result = await bulkOwnerUpdateListings(session.user.id, ids, action)
    revalidatePath('/dashboard/listings')
    return { ok: true, ...result }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }
}
