import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Narrow City lookup used by the admin "Nouveau quartier" create page
 * (`/admin/geo/cities/[citySlug]/neighborhoods/new`) to verify the
 * parent city exists before rendering the form.
 *
 * Architecture rule #2 — routes don't hit Prisma directly. This query
 * sits behind the admin-geo feature barrel so a future caching /
 * instrumentation layer has a single insertion point.
 */
export type CityForAdmin = {
  slug: string
  nameFr: string
}

export async function getCityForAdmin(
  citySlug: string,
): Promise<CityForAdmin | null> {
  return prisma.city.findUnique({
    where: { slug: citySlug },
    select: { slug: true, nameFr: true },
  })
}
