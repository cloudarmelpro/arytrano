import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { CITY_SEEDS } from './seed-helpers/cities'
import {
  buildEditorialFor,
  buildQuizProfileFor,
} from './seed-helpers/neighborhood-payload'
import { UNIVERSITY_SEEDS } from './seed-helpers/universities'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

/**
 * Seeds the City + Neighborhood tables for the 5 launch cities :
 *   - Fianarantsoa (v0.5 launch baseline)
 *   - Antananarivo, Toamasina, Mahajanga, Toliara (E-T07 v1)
 *
 * Idempotent : upsert by `slug` on cities, by `(cityId, slug)` on
 * neighborhoods. Re-running the seed updates lat/lng + names without
 * touching listings, photos, or any other downstream rows.
 *
 * Quartier data was selected for student-relevance (proximity to
 * universities + lycées + centre-ville rentable). Coordinates are
 * centre-of-fokontany approximations — fine for the v1 map overlay
 * and pin clustering, refine with a GIS source post-launch.
 */
async function main() {
  let totalNeighborhoods = 0
  for (const seed of CITY_SEEDS) {
    const city = await prisma.city.upsert({
      where: { slug: seed.slug },
      create: {
        slug: seed.slug,
        nameFr: seed.nameFr,
        nameMg: seed.nameMg,
        lat: seed.lat,
        lng: seed.lng,
      },
      update: {
        nameFr: seed.nameFr,
        nameMg: seed.nameMg,
        lat: seed.lat,
        lng: seed.lng,
      },
    })
    for (const n of seed.neighborhoods) {
      // E-T07 Batch A — hydrate the new JSONB columns from the TS
      // source of truth. Editorial is null for the 4 new cities
      // (no descriptors yet); quizProfile is populated for all 5
      // launch cities (profiles added today).
      const editorial = buildEditorialFor(n.slug)
      const quizProfile = buildQuizProfileFor(seed.slug, n.slug)

      // Re-seed safety (audit 2026-05-27 finding M1) : if a row
      // already exists with a non-null editorial / quizProfile, it
      // means an admin has refined the content via `/admin/geo`.
      // Skip overwriting those columns on re-seed so the refined
      // version survives. First-time seed (existing == null on both)
      // still writes the draft so brand-new DBs come up populated.
      const existing = await prisma.neighborhood.findUnique({
        where: { cityId_slug: { cityId: city.id, slug: n.slug } },
        select: { id: true, editorial: true, quizProfile: true },
      })
      // `Prisma.DbNull` writes SQL NULL ; `undefined` skips the
      // column entirely (keeps whatever's already there).
      const editorialUpdate = existing?.editorial
        ? undefined
        : (editorial ?? Prisma.DbNull)
      const quizProfileUpdate = existing?.quizProfile
        ? undefined
        : (quizProfile ?? Prisma.DbNull)
      const editorialCreate = editorial ?? Prisma.DbNull
      const quizProfileCreate = quizProfile ?? Prisma.DbNull

      await prisma.neighborhood.upsert({
        where: { cityId_slug: { cityId: city.id, slug: n.slug } },
        create: {
          ...n,
          cityId: city.id,
          editorial: editorialCreate,
          quizProfile: quizProfileCreate,
        },
        update: {
          nameFr: n.nameFr,
          nameMg: n.nameMg,
          lat: n.lat,
          lng: n.lng,
          ...(editorialUpdate !== undefined && { editorial: editorialUpdate }),
          ...(quizProfileUpdate !== undefined && {
            quizProfile: quizProfileUpdate,
          }),
        },
      })
    }
    totalNeighborhoods += seed.neighborhoods.length
    console.log(`✅ ${seed.nameFr} + ${seed.neighborhoods.length} quartiers`)
  }
  console.log(
    `\n${CITY_SEEDS.length} cities · ${totalNeighborhoods} neighborhoods seeded`,
  )

  // TEN-11 — universities. Upsert by slug so re-runs refresh coords.
  let totalUniversities = 0
  for (const uni of UNIVERSITY_SEEDS) {
    const city = await prisma.city.findUnique({ where: { slug: uni.citySlug } })
    if (!city) {
      console.warn(`⚠️  Skipping university ${uni.slug}: city ${uni.citySlug} not found`)
      continue
    }
    await prisma.university.upsert({
      where: { slug: uni.slug },
      create: {
        slug: uni.slug,
        cityId: city.id,
        nameFr: uni.nameFr,
        acronym: uni.acronym,
        lat: uni.lat,
        lng: uni.lng,
        address: uni.address,
      },
      update: {
        cityId: city.id,
        nameFr: uni.nameFr,
        acronym: uni.acronym,
        lat: uni.lat,
        lng: uni.lng,
        address: uni.address,
      },
    })
    totalUniversities += 1
  }
  console.log(`${totalUniversities} universities seeded`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect().then(() => process.exit(1))
  })
