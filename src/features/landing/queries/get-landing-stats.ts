import 'server-only'
import { prisma } from '@/lib/db'

export type LandingStats = {
  publishedListings: number
  neighborhoods: number
  verifiedOwners: number
}

export async function getLandingStats(): Promise<LandingStats> {
  const [publishedListings, neighborhoods, verifiedOwners] = await Promise.all([
    prisma.listing.count({ where: { status: 'PUBLISHED' } }),
    prisma.neighborhood.count(),
    prisma.ownerProfile.count({ where: { verifiedAt: { not: null } } }),
  ])
  return { publishedListings, neighborhoods, verifiedOwners }
}
