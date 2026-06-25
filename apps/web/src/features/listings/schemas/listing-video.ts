import { z } from 'zod'

/**
 * T-059 — accept walkthrough video uploads from the listing edit page.
 *
 * Limits (client-side hints + server-side enforcement) :
 *  - MIME : video/mp4 | quicktime | webm
 *  - Size : 50 MB hard cap (3G upload cap, Cloudinary plan friendly)
 *  - Duration : enforced server-side after Cloudinary returns it
 */

export const MAX_LISTING_VIDEO_BYTES = 50 * 1024 * 1024 // 50 MB
export const MAX_LISTING_VIDEO_DURATION_SEC = 120 // 2 minutes
export const ACCEPTED_VIDEO_MIME = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
] as const

export function parseListingVideoFile(file: unknown): File {
  if (!(file instanceof File)) {
    throw new Error('Aucun fichier vidéo reçu.')
  }
  if (!ACCEPTED_VIDEO_MIME.includes(file.type as (typeof ACCEPTED_VIDEO_MIME)[number])) {
    throw new Error(
      'Format vidéo refusé — MP4, MOV ou WebM uniquement.',
    )
  }
  if (file.size > MAX_LISTING_VIDEO_BYTES) {
    throw new Error('Vidéo trop lourde — 50 Mo maximum.')
  }
  if (file.size === 0) {
    throw new Error('Fichier vide.')
  }
  return file
}

export const listingVideoActionInputSchema = z.object({
  listingId: z
    .string()
    .regex(/^c[a-z0-9]{20,40}$/, 'Identifiant invalide'),
})
