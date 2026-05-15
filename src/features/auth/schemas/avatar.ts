import { z } from 'zod'

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
export const AVATAR_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
] as const

/** Validates a File-like object (type + size). The `instanceof File` guard
 *  is applied at the call site since File semantics differ between Node
 *  (multipart parsed) and edge runtimes. */
export const avatarFileSchema = z.object({
  type: z.enum(AVATAR_ACCEPTED_TYPES, {
    message: `Type non supporté. Formats acceptés : JPG, PNG, WebP, HEIC`,
  }),
  size: z
    .number()
    .int()
    .positive('Fichier vide')
    .max(AVATAR_MAX_BYTES, 'Fichier trop grand (max 5 Mo)'),
})

export type AvatarFileInput = z.infer<typeof avatarFileSchema>

export function parseAvatarFile(file: File): AvatarFileInput {
  return avatarFileSchema.parse({ type: file.type, size: file.size })
}
