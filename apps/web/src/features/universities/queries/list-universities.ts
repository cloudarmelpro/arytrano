import 'server-only'
import { prisma } from '@/lib/db'

export type UniversityListItem = {
  slug: string
  acronym: string
  nameFr: string
  citySlug: string
  cityNameFr: string
}

/**
 * TEN-11 — fuels the "Près de :" dropdown in the search sidebar. Sorted
 * by acronym so common pickers (IPNT, INSCAE, UA) bubble to the top.
 */
export async function listUniversities(): Promise<UniversityListItem[]> {
  const rows = await prisma.university.findMany({
    orderBy: [{ acronym: 'asc' }],
    select: {
      slug: true,
      acronym: true,
      nameFr: true,
      city: { select: { slug: true, nameFr: true } },
    },
  })
  return rows.map((r) => ({
    slug: r.slug,
    acronym: r.acronym,
    nameFr: r.nameFr,
    citySlug: r.city.slug,
    cityNameFr: r.city.nameFr,
  }))
}
