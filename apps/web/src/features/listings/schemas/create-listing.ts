import { z } from 'zod'

export const listingTypeSchema = z.enum(['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE'])

// Keep in sync with the `Amenity` enum in prisma/schema.prisma — Zod can't
// reference Prisma enums at type-level without a generator step, and the
// values must be string literals for both runtimes (server validation +
// mobile JSON body parsing).
export const amenitySchema = z.enum([
  'WIFI',
  'PARKING',
  'MOTO_PARKING',
  'HOT_WATER',
  'WATER_TANK',
  'GENERATOR',
  'AIR_CONDITIONING',
  'KITCHEN_EQUIPPED',
  'WASHING_MACHINE',
  'GUARD',
  'SECURITY_GATE',
  'TERRACE',
  'GARDEN',
  'STUDY_DESK',
  'CLOSE_TO_UNIVERSITY',
  'CLOSE_TO_MARKET',
  'PUBLIC_TRANSPORT',
])

/**
 * Input for creating a listing in DRAFT status.
 * Owner can fill in details progressively; only the required minimum here.
 */
export const createListingSchema = z.object({
  title: z
    .string()
    .min(5, 'Au moins 5 caractères')
    .max(120, '120 caractères maximum')
    // No control chars (CR/LF/TAB) — they could inject SMTP headers when the
    // title flows into the `Subject:` of admin notification emails. Also
    // generally bad for breadcrumbs / OG titles.
    .regex(/^[^\r\n\t]+$/, 'Le titre ne peut pas contenir de saut de ligne'),
  description: z
    .string()
    .min(20, 'Décris ton logement (au moins 20 caractères)')
    .max(2000, '2000 caractères maximum'),
  type: listingTypeSchema,
  priceMonthlyMGA: z.coerce
    .number({ message: 'Prix en Ariary par mois' })
    .int('Le prix doit être un entier')
    .positive('Le prix doit être positif')
    .max(100_000_000, 'Prix invalide'),
  // E-T26 — caution declared as a multiplier on the monthly rent.
  // 0 = no caution (some bailleurs MG don't take one). Range 0-3
  // covers standard Madagascar practice.
  cautionMonths: z.coerce
    .number({ message: 'Nombre de mois de caution' })
    .int('Nombre de mois entier')
    .min(0, 'Au moins 0')
    .max(3, '3 mois maximum')
    .optional()
    .default(2),
  cityId: z.string().min(1, 'Choisis une ville'),
  neighborhoodId: z.string().min(1, 'Choisis un quartier'),
  surfaceM2: z.coerce.number().int().positive().max(10_000).optional(),
  bedrooms: z.coerce.number().int().nonnegative().max(50).optional(),
  bathrooms: z.coerce.number().int().nonnegative().max(20).optional(),
  furnished: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .transform((v) => v === true || v === 'true')
    .optional()
    .default(false),
  // Amenity multi-select — empty array is the schema default for new
  // listings; owners pick zero or more from the catalog.
  amenities: z.array(amenitySchema).max(20).optional().default([]),
  // Owner-defined free-form amenities (when nothing in the catalog fits).
  // Max 10 entries × 60 chars; no CR/LF/TAB to keep the label safe for
  // display + future email subjects.
  customAmenities: z
    .array(
      z
        .string()
        .trim()
        .min(2, 'Au moins 2 caractères')
        .max(60, '60 caractères maximum')
        .regex(/^[^\r\n\t]+$/, 'Caractères de contrôle non autorisés'),
    )
    .max(10, '10 équipements personnalisés maximum')
    .optional()
    .default([]),
})

export type CreateListingInput = z.infer<typeof createListingSchema>
