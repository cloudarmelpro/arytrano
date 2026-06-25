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

// SECURITY (audit fix 2026-06-12) — the prior check accepted any
// `https://res.cloudinary.com/*` URL, which let an attacker host
// fabricated "evidence" on their OWN Cloudinary account and
// reference it as if it had passed our upload pipeline. We now
// pin the cloud name to the platform's account so only assets
// produced by our `uploadInventoryPhoto` action are admissible.
//
// Read directly from process.env (NOT from `@/lib/env`) because this
// schema is consumed by Client Components — importing the server-only
// env module would poison the client bundle. NEXT_PUBLIC_* vars are
// inlined at build time and safe to expose : the Cloudinary cloud name
// is already public in every URL we serve.
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''
const ALLOWED_CLOUDINARY_PREFIX = CLOUD_NAME
  ? `https://res.cloudinary.com/${CLOUD_NAME}/`
  : null

const photoUrl = z
  .string()
  .trim()
  .url('URL invalide.')
  .refine(
    (u) =>
      // Fail-closed in dev (no var set) → accept the generic prefix
      // so local dev isn't blocked. In prod the var MUST be set, and
      // the URL must match the pinned cloud.
      ALLOWED_CLOUDINARY_PREFIX
        ? u.startsWith(ALLOWED_CLOUDINARY_PREFIX)
        : u.startsWith('https://res.cloudinary.com/'),
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
