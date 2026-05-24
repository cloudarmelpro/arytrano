import { z } from 'zod'

export const LISTING_PHOTO_MAX_BYTES = 5 * 1024 * 1024
export const LISTING_PHOTO_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
] as const
export const MAX_PHOTOS_PER_LISTING = 8

export const listingPhotoFileSchema = z.object({
  type: z.enum(LISTING_PHOTO_ACCEPTED_TYPES, {
    message: 'Format non supporté. JPG, PNG, WebP ou HEIC uniquement.',
  }),
  size: z
    .number()
    .int()
    .positive('Fichier vide')
    .max(LISTING_PHOTO_MAX_BYTES, 'Fichier trop grand (5 Mo max)'),
})

export function parseListingPhotoFile(file: File) {
  return listingPhotoFileSchema.parse({ type: file.type, size: file.size })
}

export const listingPhotoIdSchema = z
  .string()
  .regex(/^[a-z0-9]{20,40}$/, 'ID photo invalide')

export const reorderPhotosSchema = z.object({
  order: z
    .array(listingPhotoIdSchema)
    .min(1, 'Aucune photo')
    .max(MAX_PHOTOS_PER_LISTING, `Max ${MAX_PHOTOS_PER_LISTING} photos`),
})

export type ReorderPhotosInput = z.infer<typeof reorderPhotosSchema>
