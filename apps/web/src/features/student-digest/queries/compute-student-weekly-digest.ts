import 'server-only'
import { prisma } from '@/lib/db'

export type StudentDigestListing = {
  id: string
  title: string
  citySlug: string
  neighborhoodSlug: string
  slug: string
  priceMonthlyMGA: number
}

export type StudentWeeklyDigestPayload = {
  studentId: string
  email: string
  name: string | null
  totals: {
    savedSearches: number
    newListings7d: number
  }
  topListings: StudentDigestListing[]
}

/**
 * MKT-07 — student weekly recap. Aggregates "listings published in
 * the last 7 days across all your saved-search cities". Filters
 * by preferredCity when set; otherwise falls back to all cities
 * the student ever saved. Skips students with no saved searches.
 */
const WINDOW_DAYS = 7

export async function listStudentsDueDigest(): Promise<string[]> {
  const rows = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      role: 'STUDENT',
      savedSearchAlertsEnabled: true,
      emailDisabledAt: null,
      // Only students who have at least one saved search.
    },
    select: {
      id: true,
      _count: { select: { savedSearches: true } },
    },
  })
  return rows.filter((r) => r._count.savedSearches > 0).map((r) => r.id)
}

export async function computeStudentWeeklyDigest(
  studentId: string,
): Promise<StudentWeeklyDigestPayload | null> {
  const [user, savedSearchCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, email: true, name: true, preferredCityId: true },
    }),
    prisma.savedSearch.count({ where: { userId: studentId } }),
  ])
  if (!user) return null
  if (savedSearchCount === 0) return null

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const listings = await prisma.listing.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { gte: since },
      ...(user.preferredCityId ? { cityId: user.preferredCityId } : {}),
    },
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      priceMonthlyMGA: true,
      city: { select: { slug: true } },
      neighborhood: { select: { slug: true } },
    },
  })

  const totalNew = await prisma.listing.count({
    where: {
      status: 'PUBLISHED',
      publishedAt: { gte: since },
      ...(user.preferredCityId ? { cityId: user.preferredCityId } : {}),
    },
  })

  return {
    studentId: user.id,
    email: user.email,
    name: user.name,
    totals: { savedSearches: savedSearchCount, newListings7d: totalNew },
    topListings: listings.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      citySlug: l.city.slug,
      neighborhoodSlug: l.neighborhood.slug,
      priceMonthlyMGA: l.priceMonthlyMGA,
    })),
  }
}
