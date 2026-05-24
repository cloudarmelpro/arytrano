import { z } from 'zod'

/**
 * Shared validation for Testimonial CRUD. Used by:
 *   - createTestimonialAction (full schema)
 *   - updateTestimonialAction (partial — `.partial()` at the action edge)
 *   - the React form (client-side validation mirror)
 *
 * `body` bounds : 30 chars min (anything shorter is too short to be
 * useful as a marketing quote), 500 max (cut-off for cards).
 * `authorName` bounds : 2-80 — covers single names ("Andry"), full
 * names ("Andry Rakoto"), and a few owners whose displayed name is
 * a small business ("Maison Rasoanaivo").
 * `authorMeta` is optional and only used as a sub-line under the name.
 * `sortOrder` is signed-ish but bounded so an admin can't write 9e9.
 */
export const testimonialAudienceSchema = z.enum(['STUDENT', 'OWNER'])

export const createTestimonialSchema = z.object({
  audience: testimonialAudienceSchema,
  body: z.string().trim().min(30, 'Au moins 30 caractères').max(500, 'Max 500 caractères'),
  authorName: z
    .string()
    .trim()
    .min(2, 'Au moins 2 caractères')
    .max(80, 'Max 80 caractères'),
  authorMeta: z
    .string()
    .trim()
    .max(200, 'Max 200 caractères')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  sortOrder: z
    .number()
    .int('Entier requis')
    .min(0, 'Doit être ≥ 0')
    .max(9999, 'Doit être ≤ 9999')
    .default(0),
  publishImmediately: z.boolean().default(false),
})

export const updateTestimonialSchema = createTestimonialSchema
  .omit({ publishImmediately: true })
  .partial()

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>
export type TestimonialAudience = z.infer<typeof testimonialAudienceSchema>
