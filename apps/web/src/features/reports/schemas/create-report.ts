import { z } from 'zod'

export const REPORT_REASONS = [
  'SCAM',
  'STOLEN_PHOTOS',
  'WRONG_INFO',
  'INAPPROPRIATE',
  'ALREADY_RENTED',
  'OTHER',
] as const

export const createReportSchema = z.object({
  listingId: z.string().regex(/^[a-z0-9]{20,40}$/, 'ID listing invalide'),
  reason: z.enum(REPORT_REASONS),
  details: z
    .string()
    .trim()
    .max(1000, 'Maximum 1000 caractères')
    .optional()
    .or(z.literal('')),
})

export type CreateReportInput = z.infer<typeof createReportSchema>
