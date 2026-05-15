import { z } from 'zod'

/** Cuid format: lowercase letters + digits, 20–40 chars. */
export const listingIdSchema = z.string().regex(/^[a-z0-9]{20,40}$/, 'ID listing invalide')
