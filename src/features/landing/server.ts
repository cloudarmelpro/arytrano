/**
 * Server-only surface of the `landing` feature.
 *
 * Re-exports the DB queries that hit Prisma. Importing this file
 * from a Client Component is a build-time error (the queries import
 * `'server-only'`) — which is exactly the guard rail we want, so
 * a misplaced import poisons nothing.
 *
 * RSC pages should `import { ... } from '@/features/landing/server'`.
 * Anything UI-related still lives on the main `@/features/landing`
 * index.
 */
export { getLandingStats, type LandingStats } from './queries/get-landing-stats'
export {
  listNeighborhoodsWithCounts,
  type NeighborhoodRow,
} from './queries/list-neighborhoods-with-counts'
export {
  getQuartiersData,
  type QuartierRow,
  type QuartiersPageData,
  type QuartierSampleListing,
} from './queries/get-quartiers-data'
export {
  getFeaturedOwnerTestimonial,
  type FeaturedTestimonial,
} from './queries/get-featured-owner-testimonial'
export {
  listCitiesWithCounts,
  type CityWithCount,
} from './queries/list-cities-with-counts'
