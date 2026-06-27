'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth'
import { prisma } from '@/lib/db'
import { deleteVideoAsset } from '@/lib/cloudinary'
import { env } from '@/lib/env'
import { MAX_LISTING_VIDEO_DURATION_SEC } from '../schemas/listing-video'

/**
 * T-059 — persist a Cloudinary-direct upload after the browser has
 * already streamed the file to Cloudinary. The payload is tiny
 * (just identifiers), so Server Action body limits are irrelevant.
 *
 * We :
 *   1. Validate the bearer is the listing owner.
 *   2. Validate the public_id is under our pinned folder so a
 *      hostile client can't link an arbitrary Cloudinary asset.
 *   3. Enforce the duration cap server-side — if Cloudinary returns
 *      a duration > 120s we destroy the freshly-uploaded asset and
 *      reject.
 *   4. Upsert the ListingVideo row + destroy any prior asset.
 */
export type ConfirmListingVideoUploadState = {
  ok: boolean
  message?: string
}

export async function confirmListingVideoUploadAction(
  _prev: ConfirmListingVideoUploadState,
  formData: FormData,
): Promise<ConfirmListingVideoUploadState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise.' }
  }

  const listingId = String(formData.get('listingId') ?? '')
  if (!/^c[a-z0-9]{20,40}$/.test(listingId)) {
    return { ok: false, message: 'Identifiant invalide.' }
  }
  const publicId = String(formData.get('publicId') ?? '')
  const url = String(formData.get('url') ?? '')
  const durationSec = Number(formData.get('durationSec') ?? 0)
  const bytes = Number(formData.get('bytes') ?? 0)

  // 1. Authz : the bearer must own the listing.
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true, video: { select: { cloudinaryId: true } } },
  })
  if (!listing) return { ok: false, message: 'Annonce introuvable.' }
  if (listing.ownerId !== session.user.id) {
    return { ok: false, message: 'Accès refusé.' }
  }

  // 2. Pin the public_id to OUR folder. A hostile client could
  //    otherwise post an attacker-controlled public_id.
  const expectedFolder = `arytrano/listings/${listingId}/video/`
  if (!publicId.startsWith(expectedFolder)) {
    return { ok: false, message: 'public_id invalide.' }
  }

  // 3. Pin the URL to our cloud + the video resource_type. Cloudinary
  //    delivery URLs always look like
  //    https://res.cloudinary.com/<cloud>/video/upload/...
  const cloudPrefix = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/video/upload`
  if (!url.startsWith(cloudPrefix)) {
    return { ok: false, message: 'URL Cloudinary invalide.' }
  }

  // 4. Duration cap.
  if (
    !Number.isFinite(durationSec) ||
    durationSec <= 0 ||
    durationSec > MAX_LISTING_VIDEO_DURATION_SEC
  ) {
    // Best-effort cleanup of the oversize asset.
    try {
      await deleteVideoAsset(publicId)
    } catch {
      /* swallow */
    }
    return {
      ok: false,
      message: `Vidéo trop longue (${Math.round(durationSec)}s) — ${MAX_LISTING_VIDEO_DURATION_SEC}s maximum.`,
    }
  }

  // 5. Build the poster URL via Cloudinary's "extract frame at 2s"
  //    delivery transform.
  const posterUrl = `${cloudPrefix}/so_2,c_fill,w_1280,h_720,q_auto,f_jpg/${publicId}.jpg`

  const previousPublicId = listing.video?.cloudinaryId
  await prisma.listingVideo.upsert({
    where: { listingId },
    create: {
      listingId,
      url,
      cloudinaryId: publicId,
      posterUrl,
      durationSec: Math.round(durationSec),
      bytes: Number.isFinite(bytes) ? Math.max(0, Math.round(bytes)) : 0,
    },
    update: {
      url,
      cloudinaryId: publicId,
      posterUrl,
      durationSec: Math.round(durationSec),
      bytes: Number.isFinite(bytes) ? Math.max(0, Math.round(bytes)) : 0,
      // Replacing the video clears any prior admin moderation flag —
      // a hidden one is gone, the new one starts PUBLISHED.
      status: 'PUBLISHED',
      hiddenById: null,
      hiddenAt: null,
      hiddenReason: null,
    },
  })

  if (previousPublicId && previousPublicId !== publicId) {
    try {
      await deleteVideoAsset(previousPublicId)
    } catch {
      /* swallow — best effort */
    }
  }

  revalidatePath(`/dashboard/listings/${listingId}/edit`)
  return { ok: true }
}
