'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/features/admin/server'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import {
  hideListingVideo,
  unhideListingVideo,
} from '../services/moderate-listing-video'

export type ModerateListingVideoState = {
  ok: boolean
  message?: string
  newStatus?: 'PUBLISHED' | 'HIDDEN_BY_ADMIN'
}

/**
 * T-059 admin moderation — bound to one Server Action so the admin
 * detail page can flip the status with a single button. The
 * `revalidatePath` calls cover the surfaces that consume the
 * video (public detail, dashboard edit, /admin/listings/[id]).
 */
export async function moderateListingVideoAction(
  _prev: ModerateListingVideoState,
  formData: FormData,
): Promise<ModerateListingVideoState> {
  // SEC-21 — DB-fresh admin gate (was JWT session.user.role, stale).
  let userId: string
  try {
    ;({ userId } = await requireAdmin())
  } catch {
    return { ok: false, message: 'Accès refusé.' }
  }

  const listingId = String(formData.get('listingId') ?? '')
  if (!/^c[a-z0-9]{20,40}$/.test(listingId)) {
    return { ok: false, message: 'Identifiant invalide.' }
  }
  const action = formData.get('action')
  const reason = String(formData.get('reason') ?? '')

  const outcome =
    action === 'unhide'
      ? await unhideListingVideo(listingId)
      : await hideListingVideo(listingId, userId, reason)

  if (outcome.kind === 'no_video') {
    return { ok: false, message: 'Aucune vidéo sur cette annonce.' }
  }

  void writeAuditLog({
    adminId: userId,
    action: action === 'unhide' ? 'video.unhide' : 'video.hide',
    targetType: 'Listing',
    targetId: listingId,
    metadata: action === 'unhide' ? undefined : { reason: reason.slice(0, 200) },
  })
  revalidatePath(`/admin/listings/${listingId}`)
  revalidatePath(`/dashboard/listings/${listingId}/edit`)
  return { ok: true, newStatus: outcome.status }
}
