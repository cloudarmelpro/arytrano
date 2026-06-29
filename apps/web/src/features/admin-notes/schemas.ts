import { z } from 'zod'

/**
 * ADM-08 — note targets are entity rows the admin scrutinizes. Restrict
 * here so a typo on the caller doesn't pollute the table with junk
 * targetType values; extend the enum when a new entity needs notes.
 */
export const adminNoteTargetTypes = ['User', 'Listing'] as const
export type AdminNoteTargetType = (typeof adminNoteTargetTypes)[number]

export const createAdminNoteSchema = z.object({
  targetType: z.enum(adminNoteTargetTypes),
  targetId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(2, 'Note trop courte')
    .max(2000, 'Note trop longue (2000 caractères max)'),
})

export type CreateAdminNoteInput = z.infer<typeof createAdminNoteSchema>
