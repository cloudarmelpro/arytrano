import 'server-only'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * Create a new City row.
 *
 * Slug is required and immutable — once a listing references a
 * `/<city>/<quartier>/<listing>` URL, changing the slug would break
 * every backlink and SEO indexing. The admin UI should make this
 * visible at create time ("ce slug ne pourra plus être changé").
 *
 * Lat/lng accept either string (Prisma Decimal) or number — we coerce
 * via `z.coerce.number()` then re-serialize as string for Prisma
 * because the `Decimal(9,6)` column wants string-typed input.
 */

export const createCityInputSchema = z.object({
  slug: z
    .string()
    .min(2, 'Slug trop court')
    .max(40, 'Slug trop long')
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

export type CreateCityInput = z.infer<typeof createCityInputSchema>

export type CreateCityOutcome =
  | { kind: 'ok'; cityId: string; slug: string }
  | { kind: 'slug_taken' }
  | { kind: 'validation_failed'; issues: Array<{ path: string; message: string }> }

export async function createCity(
  rawInput: unknown,
): Promise<CreateCityOutcome> {
  const parsed = createCityInputSchema.safeParse(rawInput)
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

  try {
    const city = await prisma.city.create({
      data: {
        slug: input.slug,
        nameFr: input.nameFr,
        nameMg: input.nameMg,
        lat: String(input.lat),
        lng: String(input.lng),
      },
      select: { id: true, slug: true },
    })
    return { kind: 'ok', cityId: city.id, slug: city.slug }
  } catch (err) {
    // P2002 = unique constraint violation on `City.slug`.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return { kind: 'slug_taken' }
    }
    throw err
  }
}
