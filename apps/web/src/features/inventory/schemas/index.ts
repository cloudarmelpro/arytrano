import { z } from 'zod'

/**
 * E-T27.2 — inventory schemas.
 *
 * `roomKey` is a free-form string (not a strict enum) so owners can
 * coin custom labels for unusual layouts. We enforce a basic shape
 * (slug-like) to keep the dashboard tidy + prevent URL/text-injection
 * issues if the value ever flows into a query string.
 *
 * Canonical room set lives in `CANONICAL_ROOMS` below — the UI uses
 * it to seed a quick-pick row, and free-text custom rooms remain
 * supported via the same regex.
 */

export const CANONICAL_ROOMS = [
  'SALON',
  'CUISINE',
  'CHAMBRE_1',
  'CHAMBRE_2',
  'CHAMBRE_3',
  'SALLE_DE_BAIN',
  'WC',
  'BALCON',
  'ENTREE',
] as const

const roomKey = z
  .string()
  .trim()
  .min(2, 'Au moins 2 caractères.')
  .max(40, '40 caractères maximum.')
  .regex(
    /^[A-Z][A-Z0-9_]*$/,
    'Caractères autorisés : majuscules, chiffres et underscore. Exemple : "CHAMBRE_2".',
  )

const photoUrl = z
  .string()
  .trim()
  .url('URL invalide.')
  .refine(
    (u) =>
      u.startsWith('https://res.cloudinary.com/') ||
      u.startsWith('https://cloudinary.com/'),
    'Seules les URLs Cloudinary sont acceptées.',
  )

export const upsertInventoryItemSchema = z.object({
  leaseId: z.string().regex(/^c[a-z0-9]{20,40}$/),
  phase: z.enum(['ENTRY', 'EXIT']),
  roomKey,
  notes: z.string().trim().max(2000, '2000 caractères maximum.').optional(),
  photoUrls: z.array(photoUrl).max(20, '20 photos maximum par pièce.'),
})
export type UpsertInventoryItemInput = z.infer<
  typeof upsertInventoryItemSchema
>

export const deleteInventoryItemSchema = z.object({
  leaseId: z.string().regex(/^c[a-z0-9]{20,40}$/),
  itemId: z.string().regex(/^c[a-z0-9]{20,40}$/),
})
export type DeleteInventoryItemInput = z.infer<
  typeof deleteInventoryItemSchema
>
