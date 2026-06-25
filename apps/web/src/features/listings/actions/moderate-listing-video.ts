'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth'
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
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
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
      : await hideListingVideo(listingId, session.user.id, reason)

  if (outcome.kind === 'no_video') {
    return { ok: false, message: 'Aucune vidéo sur cette annonce.' }
  }

  revalidatePath(`/admin/listings/${listingId}`)
  revalidatePath(`/dashboard/listings/${listingId}/edit`)
  return { ok: true, newStatus: outcome.status }
}
