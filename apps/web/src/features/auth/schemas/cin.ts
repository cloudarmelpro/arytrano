import { z } from 'zod'

export const CIN_MAX_BYTES = 5 * 1024 * 1024
export const CIN_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
] as const

/**
 * Validates the CIN file (type + size). PDF is allowed in addition to
 * images because many Malagasy administrations issue CIN scans as PDF.
 * `instanceof File` is enforced at the call site (parseCinFile).
 */
export const cinFileSchema = z.object({
  type: z.enum(CIN_ACCEPTED_TYPES, {
    message:
      "Type non supporté. Formats acceptés : JPG, PNG, WebP, HEIC, PDF",
  }),
  size: z
    .number()
    .int()
    .positive('Fichier vide')
    .max(CIN_MAX_BYTES, 'Fichier trop grand (max 5 Mo)'),
})

export type CinFileInput = z.infer<typeof cinFileSchema>

export function parseCinFile(file: File): CinFileInput {
  return cinFileSchema.parse({ type: file.type, size: file.size })
}
