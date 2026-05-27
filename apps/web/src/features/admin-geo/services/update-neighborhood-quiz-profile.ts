import 'server-only'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { quartierQuizProfileSchema } from '@/features/geo'
import { errors } from '@/lib/api/errors'

/**
 * Update the quizProfile JSON on a Neighborhood row.
 *
 * Always Zod-validated against `quartierQuizProfileSchema` BEFORE the
 * UPDATE — invalid shapes never touch the column. Passing
 * `quizProfile: null` clears the column so the row stops appearing in
 * Q0 city dropdown (the wizard derives `quizCities` from the rows that
 * have a profile).
 *
 * The schema enforces bounds (scores 0-3, enums for vibe/priceTier),
 * which is the load-bearing safety net here — an admin can change
 * recommendations but can't smuggle nonsense numbers that would
 * silently rank a quartier #1 forever.
 */

export type UpdateQuizProfileInput = {
  citySlug: string
  neighborhoodSlug: string
  /** `null` = clear the field (revert to seed-default at next re-seed). */
  quizProfile: unknown
}

export type UpdateOutcome =
  | { kind: 'ok'; neighborhoodId: string }
  | { kind: 'not_found' }
  | { kind: 'validation_failed'; issues: Array<{ path: string; message: string }> }

export async function updateNeighborhoodQuizProfile(
  input: UpdateQuizProfileInput,
): Promise<UpdateOutcome> {
  const row = await prisma.neighborhood.findFirst({
    where: {
      slug: input.neighborhoodSlug,
      city: { slug: input.citySlug },
    },
    select: { id: true },
  })
  if (!row) return { kind: 'not_found' }

  let value: Prisma.InputJsonValue | typeof Prisma.DbNull
  if (input.quizProfile === null) {
    value = Prisma.DbNull
  } else {
    const parsed = quartierQuizProfileSchema.safeParse(input.quizProfile)
    if (!parsed.success) {
      return {
        kind: 'validation_failed',
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      }
    }
    value = parsed.data as unknown as Prisma.InputJsonValue
  }

  await prisma.neighborhood.update({
    where: { id: row.id },
    data: { quizProfile: value },
  })

  return { kind: 'ok', neighborhoodId: row.id }
}

/** Helper that throws — for REST handlers / actions that prefer the
 *  errors helper to a switch. Same shape as updateNeighborhoodEditorialOrThrow. */
export async function updateNeighborhoodQuizProfileOrThrow(
  input: UpdateQuizProfileInput,
): Promise<string> {
  const r = await updateNeighborhoodQuizProfile(input)
  switch (r.kind) {
    case 'ok':
      return r.neighborhoodId
    case 'not_found':
      throw errors.notFound('Quartier introuvable')
    case 'validation_failed':
      throw errors.validation(
        'Champs invalides',
        Object.fromEntries(r.issues.map((i) => [i.path, [i.message]])),
      )
  }
}
