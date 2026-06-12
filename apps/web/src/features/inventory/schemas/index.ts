import { z } from 'zod'
import { env } from '@/lib/env'

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

// SECURITY (audit fix 2026-06-12) — the prior check accepted any
// `https://res.cloudinary.com/*` URL, which let an attacker host
// fabricated "evidence" on their OWN Cloudinary account and
// reference it as if it had passed our upload pipeline. We now
// pin the cloud name to the platform's account so only assets
// produced by our `uploadInventoryPhoto` action are admissible.
const ALLOWED_CLOUDINARY_PREFIX = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/`

const photoUrl = z
  .string()
  .trim()
  .url('URL invalide.')
  .refine(
    (u) => u.startsWith(ALLOWED_CLOUDINARY_PREFIX),
    'URL externe rejetée — la photo doit passer par AryTrano.',
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
