import 'server-only'
import { prisma } from '@/lib/db'
import { maybeWatermark } from '@/lib/cloudinary/watermark'

export type QuartierSampleListing = {
  id: string
  slug: string
  title: string
  type: 'ROOM' | 'STUDIO' | 'APARTMENT' | 'HOUSE'
  priceMonthlyMGA: number
  photo: {
    url: string
    width: number
    height: number
    blurhash: string | null
    altFr: string | null
  } | null
}

export type QuartierRow = {
  id: string
  slug: string
  nameFr: string
  nameMg: string
  citySlug: string
  publishedListings: number
  avgPriceMGA: number | null
  sampleListings: QuartierSampleListing[]
}

export type QuartiersPageData = {
  quartiers: QuartierRow[]
  totalListings: number
}

export async function getQuartiersData(): Promise<QuartiersPageData> {
  const rows = await prisma.neighborhood.findMany({
    select: {
      id: true,
      slug: true,
      nameFr: true,
      nameMg: true,
      city: { select: { slug: true } },
      listings: {
        where: { status: 'PUBLISHED' },
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          priceMonthlyMGA: true,
          watermarkOptIn: true,
          photos: {
            take: 1,
            orderBy: { position: 'asc' },
            select: {
              url: true,
              width: true,
              height: true,
              blurhash: true,
              altFr: true,
            },
          },
        },
      },
    },
  })

  const quartiers = rows
    .map((r) => {
      const prices = r.listings.map((l) => l.priceMonthlyMGA)
      const avgPriceMGA = prices.length
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : null
      const sampleListings: QuartierSampleListing[] = r.listings
        .slice(0, 2)
        .map((l) => ({
          id: l.id,
          slug: l.slug,
          title: l.title,
          type: l.type,
          priceMonthlyMGA: l.priceMonthlyMGA,
          photo: l.photos[0]
            ? {
                ...l.photos[0],
                url: maybeWatermark(l.photos[0].url, l.watermarkOptIn),
              }
            : null,
        }))
      return {
        id: r.id,
        slug: r.slug,
        nameFr: r.nameFr,
        nameMg: r.nameMg,
        citySlug: r.city.slug,
        publishedListings: r.listings.length,
        avgPriceMGA,
        sampleListings,
      }
    })
    .sort((a, b) => {
      if (b.publishedListings !== a.publishedListings) {
        return b.publishedListings - a.publishedListings
      }
      return a.nameFr.localeCompare(b.nameFr)
    })

  const totalListings = quartiers.reduce(
    (s, q) => s + q.publishedListings,
    0,
  )

  return { quartiers, totalListings }
}
