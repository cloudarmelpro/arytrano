import 'server-only'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { neighborhoodEditorialSchema } from '@/features/geo'

/**
 * Update the editorial JSON on a Neighborhood row.
 *
 * Always Zod-validated against `neighborhoodEditorialSchema` BEFORE the
 * UPDATE — invalid shapes never touch the column. Passing
 * `editorial: null` resets the column to NULL so consumers fall back
 * to the legacy TS dictionary (useful if the admin wants to revert
 * to the pre-Batch-C content).
 *
 * Caller is expected to have run `requireAdmin()` already; this
 * service trusts the caller and only does input validation +
 * persistence. Same pattern as other admin services in the codebase.
 */

export type UpdateNeighborhoodEditorialInput = {
  citySlug: string
  neighborhoodSlug: string
  /** `null` = clear the field (revert to TS-dictionary fallback). */
  editorial: unknown
}

export type UpdateOutcome =
  | { kind: 'ok'; neighborhoodId: string }
  | { kind: 'not_found' }
  | { kind: 'validation_failed'; issues: Array<{ path: string; message: string }> }

export async function updateNeighborhoodEditorial(
  input: UpdateNeighborhoodEditorialInput,
): Promise<UpdateOutcome> {
  // Locate the row first — the composite `@@unique([cityId, slug])`
  // means we cannot UPDATE by slug alone.
  const row = await prisma.neighborhood.findFirst({
    where: {
      slug: input.neighborhoodSlug,
      city: { slug: input.citySlug },
    },
    select: { id: true },
  })
  if (!row) return { kind: 'not_found' }

  // Null = clear. Otherwise Zod-validate the shape.
  let value: Prisma.InputJsonValue | typeof Prisma.DbNull
  if (input.editorial === null) {
    value = Prisma.DbNull
  } else {
    const parsed = neighborhoodEditorialSchema.safeParse(input.editorial)
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
    data: { editorial: value },
  })

  return { kind: 'ok', neighborhoodId: row.id }
}

