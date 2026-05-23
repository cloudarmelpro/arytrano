import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Dev-only seed: creates ~12 PUBLISHED listings spread across
 * Fianarantsoa quartiers so map clustering + grid views have real
 * data to show during local browser verification.
 *
 * Safe to re-run — uses a deterministic seed-owner email so listings
 * upsert against the same owner each time. Listings themselves are
 * keyed by slug for idempotency.
 *
 *   npx tsx prisma/scripts/seed-dev-listings.ts
 *
 * Do NOT run against production — uses placeholder Cloudinary URLs.
 */

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

const DEV_OWNER_EMAIL = 'dev-owner@arytrano.local'

const LISTINGS: Array<{
  citySlug: string
  neighborhoodSlug: string
  slug: string
  title: string
  description: string
  type: 'ROOM' | 'STUDIO' | 'APARTMENT' | 'HOUSE'
  priceMonthlyMGA: number
  surfaceM2: number
  bedrooms: number
  bathrooms: number
  furnished: boolean
}> = [
  {
    citySlug: 'fianarantsoa',
    neighborhoodSlug: 'andrainjato',
    slug: 'studio-andrainjato-meuble-1',
    title: 'Studio meublé à Andrainjato — proche fac',
    description: 'Studio lumineux meublé, calme, 5 min à pied du campus universitaire d\'Andrainjato.',
    type: 'STUDIO',
    priceMonthlyMGA: 220_000,
    surfaceM2: 22,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
  },
  {
    citySlug: 'fianarantsoa',
    neighborhoodSlug: 'andrainjato',
    slug: 'chambre-andrainjato-etudiante-2',
    title: 'Chambre étudiante à Andrainjato',
    description: 'Chambre simple meublée, cuisine partagée, ambiance étudiante.',
    type: 'ROOM',
    priceMonthlyMGA: 120_000,
    surfaceM2: 12,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
  },
  {
    citySlug: 'fianarantsoa',
    neighborhoodSlug: 'ambalavato',
    slug: 'appartement-ambalavato-2chambres-3',
    title: 'Appartement 2 chambres à Ambalavato',
    description: 'T3 spacieux, balcon, eau chaude, parking sécurisé.',
    type: 'APARTMENT',
    priceMonthlyMGA: 480_000,
    surfaceM2: 65,
    bedrooms: 2,
    bathrooms: 1,
    furnished: false,
  },
  {
    citySlug: 'fianarantsoa',
    neighborhoodSlug: 'anjoma',
    slug: 'studio-anjoma-balcon-4',
    title: 'Studio avec balcon à Anjoma',
    description: 'Studio moderne avec balcon, vue dégagée, proche transport.',
    type: 'STUDIO',
    priceMonthlyMGA: 260_000,
    surfaceM2: 28,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
  },
  {
    citySlug: 'fianarantsoa',
    neighborhoodSlug: 'antarandolo',
    slug: 'maison-antarandolo-jardin-5',
    title: 'Maison avec jardin à Antarandolo',
    description: 'Maison familiale 3 chambres, jardin clos, garage.',
    type: 'HOUSE',
    priceMonthlyMGA: 750_000,
    surfaceM2: 110,
    bedrooms: 3,
    bathrooms: 2,
    furnished: false,
  },
  {
    citySlug: 'fianarantsoa',
    neighborhoodSlug: 'ankidona',
    slug: 'chambre-ankidona-economique-6',
    title: 'Chambre économique à Ankidona',
    description: 'Petite chambre meublée, idéale étudiant budget serré.',
    type: 'ROOM',
    priceMonthlyMGA: 95_000,
    surfaceM2: 10,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
  },
  {
    citySlug: 'fianarantsoa',
    neighborhoodSlug: 'andrainjato',
    slug: 'studio-andrainjato-renove-7',
    title: 'Studio rénové à Andrainjato',
    description: 'Studio entièrement rénové en 2025, cuisine équipée.',
    type: 'STUDIO',
    priceMonthlyMGA: 300_000,
    surfaceM2: 25,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
  },
  {
    citySlug: 'antananarivo',
    neighborhoodSlug: 'analakely',
    slug: 'appartement-analakely-centre-8',
    title: 'Appartement centre Analakely',
    description: 'T2 en plein centre, proche Avenue de l\'Indépendance.',
    type: 'APARTMENT',
    priceMonthlyMGA: 550_000,
    surfaceM2: 50,
    bedrooms: 2,
    bathrooms: 1,
    furnished: false,
  },
  {
    citySlug: 'antananarivo',
    neighborhoodSlug: 'antanimena',
    slug: 'studio-antanimena-meuble-9',
    title: 'Studio meublé Antanimena',
    description: 'Studio meublé moderne, internet inclus.',
    type: 'STUDIO',
    priceMonthlyMGA: 380_000,
    surfaceM2: 24,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
  },
  {
    citySlug: 'fianarantsoa',
    neighborhoodSlug: 'ambalavato',
    slug: 'chambre-ambalavato-cuisine-10',
    title: 'Chambre Ambalavato avec cuisine privée',
    description: 'Chambre avec coin cuisine, eau chaude, quartier calme.',
    type: 'ROOM',
    priceMonthlyMGA: 145_000,
    surfaceM2: 15,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
  },
  {
    citySlug: 'fianarantsoa',
    neighborhoodSlug: 'anjoma',
    slug: 'appartement-anjoma-famille-11',
    title: 'Appartement familial Anjoma',
    description: 'T3 spacieux pour famille, proche écoles + marché.',
    type: 'APARTMENT',
    priceMonthlyMGA: 520_000,
    surfaceM2: 78,
    bedrooms: 3,
    bathrooms: 2,
    furnished: false,
  },
  {
    citySlug: 'fianarantsoa',
    neighborhoodSlug: 'andrainjato',
    slug: 'studio-andrainjato-balcon-12',
    title: 'Studio avec balcon Andrainjato — vue colline',
    description: 'Studio meublé, balcon avec vue, parfait pour étudiant.',
    type: 'STUDIO',
    priceMonthlyMGA: 280_000,
    surfaceM2: 26,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
  },
]

const SAMPLE_PHOTO_URL =
  'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: DEV_OWNER_EMAIL },
    update: {},
    create: {
      email: DEV_OWNER_EMAIL,
      name: 'Rakoto Dev',
      phone: '+261341234567',
      role: 'OWNER',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  })

  // Index cities + neighborhoods so we can resolve slugs → ids.
  const cities = await prisma.city.findMany({
    select: {
      id: true,
      slug: true,
      neighborhoods: { select: { id: true, slug: true } },
    },
  })
  const cityBySlug = new Map(cities.map((c) => [c.slug, c]))

  let created = 0
  let updated = 0
  for (const l of LISTINGS) {
    const city = cityBySlug.get(l.citySlug)
    if (!city) {
      console.warn(`Skipping ${l.slug}: city ${l.citySlug} not seeded`)
      continue
    }
    const neighborhood = city.neighborhoods.find((n) => n.slug === l.neighborhoodSlug)
    if (!neighborhood) {
      console.warn(`Skipping ${l.slug}: neighborhood ${l.neighborhoodSlug} not in ${l.citySlug}`)
      continue
    }

    const existing = await prisma.listing.findFirst({
      where: { slug: l.slug },
      select: { id: true },
    })

    if (existing) {
      await prisma.listing.update({
        where: { id: existing.id },
        data: {
          title: l.title,
          description: l.description,
          type: l.type,
          priceMonthlyMGA: l.priceMonthlyMGA,
          surfaceM2: l.surfaceM2,
          bedrooms: l.bedrooms,
          bathrooms: l.bathrooms,
          furnished: l.furnished,
          status: 'PUBLISHED',
          publishedAt: existing ? undefined : new Date(),
        },
      })
      updated++
    } else {
      const listing = await prisma.listing.create({
        data: {
          ownerId: owner.id,
          cityId: city.id,
          neighborhoodId: neighborhood.id,
          slug: l.slug,
          title: l.title,
          description: l.description,
          type: l.type,
          priceMonthlyMGA: l.priceMonthlyMGA,
          surfaceM2: l.surfaceM2,
          bedrooms: l.bedrooms,
          bathrooms: l.bathrooms,
          furnished: l.furnished,
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      })
      // One placeholder photo per listing — needed so the grid card
      // renders a thumbnail.
      await prisma.listingPhoto.create({
        data: {
          listingId: listing.id,
          url: SAMPLE_PHOTO_URL,
          cloudinaryId: 'demo/sample',
          width: 1200,
          height: 800,
          altFr: l.title,
          position: 0,
        },
      })
      created++
    }
  }

  console.log(`Dev listings seed : ${created} created, ${updated} updated`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
