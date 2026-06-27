'use server'

import { auth } from '@/features/auth'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { v2 as cloudinary } from 'cloudinary'

/**
 * T-059 — return Cloudinary signed-upload credentials for a video.
 *
 * The browser then POSTs the file directly to Cloudinary's video
 * upload endpoint (bypassing the Vercel function entirely so there's
 * no body-size limit, no function timeout, no double-bandwidth).
 *
 * On success the browser calls `confirmListingVideoUploadAction`
 * below with the public_id + delivery URL Cloudinary returned, which
 * is a tiny payload that comfortably fits any Server Action limit.
 *
 * Long-term : the same pattern ports cleanly to S3 pre-signed PUT
 * URLs once we migrate asset storage to AWS.
 */
export type SignListingVideoUploadState = {
  ok: boolean
  message?: string
  signature?: string
  timestamp?: number
  cloudName?: string
  apiKey?: string
  folder?: string
}

export async function signListingVideoUploadAction(
  _prev: SignListingVideoUploadState,
  formData: FormData,
): Promise<SignListingVideoUploadState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise.' }
  }

  const listingId = String(formData.get('listingId') ?? '')
  if (!/^c[a-z0-9]{20,40}$/.test(listingId)) {
    return { ok: false, message: 'Identifiant invalide.' }
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true },
  })
  if (!listing) return { ok: false, message: 'Annonce introuvable.' }
  if (listing.ownerId !== session.user.id) {
    return { ok: false, message: 'Accès refusé.' }
  }

  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    return { ok: false, message: 'Cloudinary non configuré.' }
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = `arytrano/listings/${listingId}/video`

  // Cloudinary signs only the params that will end up in the upload
  // request. Keep this list IDENTICAL to what the browser sends below
  // — any drift and Cloudinary returns 401.
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  }
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET,
  )

  return {
    ok: true,
    signature,
    timestamp,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    folder,
  }
}
