import 'server-only'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * Create a new Neighborhood row scoped to a parent city.
 *
 * Same slug-immutability convention as the City. The composite
 * `@@unique([cityId, slug])` lets the same slug exist in different
 * cities (`anjoma` in Fianarantsoa AND Toamasina is valid) — only
 * collisions within the same city are rejected.
 */

export const createNeighborhoodInputSchema = z.object({
  citySlug: z.string().min(1),
  slug: z
    .string()
    .min(2, 'Slug trop court')
    .max(60, 'Slug trop long')
    .regex(
      /^[a-z0-9-]+$/,
      'Lettres minuscules / chiffres / tirets uniquement',
    )
    .refine((s) => !s.startsWith('-') && !s.endsWith('-'), {
      message: 'Pas de tiret en début ou fin',
    }),
  nameFr: z.string().min(2).max(60),
  nameMg: z.string().min(2).max(60),
  lat: z.coerce.number().gte(-90).lte(90),
  lng: z.coerce.number().gte(-180).lte(180),
})

export type CreateNeighborhoodInput = z.infer<
  typeof createNeighborhoodInputSchema
>

export type CreateNeighborhoodOutcome =
  | { kind: 'ok'; neighborhoodId: string; slug: string }
  | { kind: 'city_not_found' }
  | { kind: 'slug_taken' }
  | {
      kind: 'validation_failed'
      issues: Array<{ path: string; message: string }>
    }

export async function createNeighborhood(
  rawInput: unknown,
): Promise<CreateNeighborhoodOutcome> {
  const parsed = createNeighborhoodInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      kind: 'validation_failed',
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    }
  }
  const input = parsed.data

  // Resolve parent city by slug.
  const city = await prisma.city.findUnique({
    where: { slug: input.citySlug },
    select: { id: true },
  })
  if (!city) return { kind: 'city_not_found' }

  try {
    const row = await prisma.neighborhood.create({
      data: {
        cityId: city.id,
        slug: input.slug,
        nameFr: input.nameFr,
        nameMg: input.nameMg,
        lat: String(input.lat),
        lng: String(input.lng),
      },
      select: { id: true, slug: true },
    })
    return { kind: 'ok', neighborhoodId: row.id, slug: row.slug }
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return { kind: 'slug_taken' }
    }
    throw err
  }
}
