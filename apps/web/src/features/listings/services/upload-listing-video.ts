import 'server-only'
import { prisma } from '@/lib/db'
import {
  uploadVideoBuffer,
  deleteVideoAsset,
  type VideoUploadResult,
} from '@/lib/cloudinary'
import { MAX_LISTING_VIDEO_DURATION_SEC } from '../schemas/listing-video'

/**
 * T-059 — upload a walkthrough video, replace any existing one.
 *
 * One video per listing in v1 — the upsert relation (@unique listingId)
 * lets us simply destroy the previous Cloudinary asset before swapping
 * the row. Caller must verify owner identity BEFORE invoking.
 */
export type UploadListingVideoOutcome =
  | { kind: 'ok'; url: string; posterUrl: string; durationSec: number; bytes: number }
  | { kind: 'too_long'; durationSec: number }
  | { kind: 'listing_not_found' }

export async function uploadListingVideo(
  listingId: string,
  file: File,
): Promise<UploadListingVideoOutcome> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, video: { select: { cloudinaryId: true } } },
  })
  if (!listing) return { kind: 'listing_not_found' }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let uploaded: VideoUploadResult
  try {
    uploaded = await uploadVideoBuffer(buffer, {
      folder: `arytrano/listings/${listingId}/video`,
    })
  } catch (err) {
    throw err instanceof Error ? err : new Error('Upload vidéo a échoué')
  }

  // Enforce duration cap server-side — Cloudinary reports it after
  // the transcode begins, so we can only check post-upload. If it's
  // over the cap, destroy the freshly-uploaded asset and reject.
  if (uploaded.durationSec > MAX_LISTING_VIDEO_DURATION_SEC) {
    await deleteVideoAsset(uploaded.publicId)
    return { kind: 'too_long', durationSec: uploaded.durationSec }
  }

  // Replace any prior video for this listing — destroy the old
  // Cloudinary asset OUTSIDE the transaction so a Cloudinary 5xx
  // doesn't roll back the upsert (orphan asset, fine ; orphan row,
  // not fine).
  const previousPublicId = listing.video?.cloudinaryId

  await prisma.listingVideo.upsert({
    where: { listingId },
    create: {
      listingId,
      url: uploaded.url,
      cloudinaryId: uploaded.publicId,
      posterUrl: uploaded.posterUrl,
      durationSec: uploaded.durationSec,
      bytes: uploaded.bytes,
    },
    update: {
      url: uploaded.url,
      cloudinaryId: uploaded.publicId,
      posterUrl: uploaded.posterUrl,
      durationSec: uploaded.durationSec,
      bytes: uploaded.bytes,
    },
  })

  if (previousPublicId && previousPublicId !== uploaded.publicId) {
    try {
      await deleteVideoAsset(previousPublicId)
    } catch {
      // Best-effort cleanup ; a dangling Cloudinary asset is a quota
      // cost but not a correctness issue.
    }
  }

  return {
    kind: 'ok',
    url: uploaded.url,
    posterUrl: uploaded.posterUrl,
    durationSec: uploaded.durationSec,
    bytes: uploaded.bytes,
  }
}

export async function deleteListingVideo(
  listingId: string,
): Promise<{ kind: 'ok' } | { kind: 'no_video' }> {
  const existing = await prisma.listingVideo.findUnique({
    where: { listingId },
    select: { cloudinaryId: true },
  })
  if (!existing) return { kind: 'no_video' }

  await prisma.listingVideo.delete({ where: { listingId } })
  try {
    await deleteVideoAsset(existing.cloudinaryId)
  } catch {
    // Same best-effort logic — the row is gone, the asset can be
    // cleaned up by the cron sweep later if Cloudinary was 5xx.
  }
  return { kind: 'ok' }
}
