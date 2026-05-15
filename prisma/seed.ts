import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

// Fianarantsoa — coordonnées centre-ville approximatives.
// Les quartiers (fokontany) ci-dessous sont les zones les plus pertinentes
// pour les étudiants (proximité Université / écoles / centre).
// NB : coordonnées à valider à terme avec source officielle.
const FIANARANTSOA = {
  slug: 'fianarantsoa',
  nameFr: 'Fianarantsoa',
  nameMg: 'Fianarantsoa',
  lat: '-21.4554',
  lng: '47.0857',
}

const NEIGHBORHOODS = [
  { slug: 'andrainjato',   nameFr: 'Andrainjato',   nameMg: 'Andrainjato',   lat: '-21.4628', lng: '47.0764' },
  { slug: 'antarandolo',   nameFr: 'Antarandolo',   nameMg: 'Antarandolo',   lat: '-21.4717', lng: '47.0728' },
  { slug: 'tsianolondroa', nameFr: 'Tsianolondroa', nameMg: 'Tsianolondroa', lat: '-21.4504', lng: '47.0856' },
  { slug: 'mahamanina',    nameFr: 'Mahamanina',    nameMg: 'Mahamanina',    lat: '-21.4581', lng: '47.0892' },
  { slug: 'anjoma',        nameFr: 'Anjoma',        nameMg: 'Anjoma',        lat: '-21.4488', lng: '47.0903' },
  { slug: 'ankidona',      nameFr: 'Ankidona',      nameMg: 'Ankidona',      lat: '-21.4395', lng: '47.0828' },
  { slug: 'ambalavato',    nameFr: 'Ambalavato',    nameMg: 'Ambalavato',    lat: '-21.4612', lng: '47.0830' },
  { slug: 'mahasoabe',     nameFr: 'Mahasoabe',     nameMg: 'Mahasoabe',     lat: '-21.4790', lng: '47.0801' },
]

async function main() {
  console.log('Seeding Fianarantsoa…')

  const city = await prisma.city.upsert({
    where: { slug: FIANARANTSOA.slug },
    create: FIANARANTSOA,
    update: {
      nameFr: FIANARANTSOA.nameFr,
      nameMg: FIANARANTSOA.nameMg,
      lat: FIANARANTSOA.lat,
      lng: FIANARANTSOA.lng,
    },
  })

  for (const n of NEIGHBORHOODS) {
    await prisma.neighborhood.upsert({
      where: { cityId_slug: { cityId: city.id, slug: n.slug } },
      create: { ...n, cityId: city.id },
      update: {
        nameFr: n.nameFr,
        nameMg: n.nameMg,
        lat: n.lat,
        lng: n.lng,
      },
    })
  }

  console.log(`✅ ${FIANARANTSOA.nameFr} + ${NEIGHBORHOODS.length} neighborhoods seeded`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect().then(() => process.exit(1))
  })
