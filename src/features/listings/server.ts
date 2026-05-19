/**
 * Server-only surface of the `listings` feature.
 *
 * Re-exports the Prisma-backed queries / services. Any import of
 * this file from a Client Component is a compile error (the modules
 * mark themselves `'server-only'`), which is exactly the safety net
 * we want.
 *
 * RSC pages should `import { ... } from '@/features/listings/server'`.
 * Schemas + UI components live on the main `@/features/listings`
 * client-safe barrel.
 */
export {
  listPublicListings,
  listPublicListingsQuerySchema,
  type ListPublicListingsQuery,
  type PublicListingsPage,
  type PublicListingCard as PublicListingCardData,
} from './queries/list-public-listings'
export { listRelatedListings } from './queries/list-related-listings'
