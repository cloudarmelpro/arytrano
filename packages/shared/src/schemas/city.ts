import { z } from 'zod'

/**
 * Public catalog of cities + neighborhoods.
 * Returned by `GET /api/v1/cities` and
 * `GET /api/v1/cities/:slug/neighborhoods`.
 */

export const publicCitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameFr: z.string(),
  nameMg: z.string(),
  lat: z.number(),
  lng: z.number(),
})

export type PublicCity = z.infer<typeof publicCitySchema>

export const publicNeighborhoodSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameFr: z.string(),
  nameMg: z.string(),
  lat: z.number(),
  lng: z.number(),
})

export type PublicNeighborhood = z.infer<typeof publicNeighborhoodSchema>
