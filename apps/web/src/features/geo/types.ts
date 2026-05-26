import { z } from 'zod'

/**
 * Canonical shapes for the `Neighborhood.editorial` and
 * `Neighborhood.quizProfile` JSONB columns added in migration
 * `20260526210000_neighborhood_editorial_quiz_profile`.
 *
 * Single source of truth — `prisma/seed-helpers/neighborhood-payload.ts`
 * writes these shapes, `features/landing/queries/*` and
 * `features/quiz/services/score-quartiers.ts` read them, and the
 * Batch C admin form will Zod-validate user input against these
 * schemas before persisting.
 *
 * Why Zod here (not just a TS type)? The JSONB columns accept ANY
 * shape at the DB level — Postgres doesn't enforce object schema. By
 * gating reads through `parseEditorial` / `parseQuizProfile`, a row
 * with a malformed payload surfaces as `null` (handled gracefully by
 * the consumer fallback) rather than crashing the page render with a
 * runtime type error.
 */

// ---------------------------------------------------------------
// Editorial — tagline / landmark / ambiance / walk / transport / distance
// ---------------------------------------------------------------

const editorialLocaleSchema = z.object({
  tagline: z.string().min(1).max(140),
  landmark: z.string().min(1).max(140),
  ambiance: z.string().min(1).max(400),
  walk: z.string().min(1).max(400),
  transport: z.string().min(1).max(200),
  distance: z.string().min(1).max(140),
})

export const neighborhoodEditorialSchema = z.object({
  fr: editorialLocaleSchema,
  mg: editorialLocaleSchema,
})

export type NeighborhoodEditorial = z.infer<typeof neighborhoodEditorialSchema>

export function parseEditorial(value: unknown): NeighborhoodEditorial | null {
  const r = neighborhoodEditorialSchema.safeParse(value)
  return r.success ? r.data : null
}

// ---------------------------------------------------------------
// Quiz scoring profile — picks the recommended quartier for the user
// ---------------------------------------------------------------

const priceTierSchema = z.enum(['low', 'mid', 'high'])
const vibeSchema = z.enum(['calm', 'lively', 'mixed'])
const housingSchema = z.enum(['ROOM', 'STUDIO', 'APARTMENT'])
const priorityStrengthSchema = z.enum(['price', 'school', 'calm', 'social'])

// 0-3 inclusive — stays in sync with the QuizAnswers weights in
// `features/quiz/types.ts`. Bumping the upper bound here without
// updating the scoring algorithm would silently break ranking.
const ZERO_TO_THREE = z.number().int().min(0).max(3)

export const quartierQuizProfileSchema = z.object({
  priceTier: priceTierSchema,
  schoolScores: z.object({
    university: ZERO_TO_THREE,
    lycee: ZERO_TO_THREE,
  }),
  housingMix: z.array(housingSchema).min(1).max(3),
  vibe: vibeSchema,
  mobilityScores: z.object({
    walk: ZERO_TO_THREE,
    taxibe: ZERO_TO_THREE,
    car: ZERO_TO_THREE,
  }),
  strengths: z.array(priorityStrengthSchema).min(1).max(4),
})

export type QuartierQuizProfile = z.infer<typeof quartierQuizProfileSchema>

export function parseQuizProfile(value: unknown): QuartierQuizProfile | null {
  const r = quartierQuizProfileSchema.safeParse(value)
  return r.success ? r.data : null
}
