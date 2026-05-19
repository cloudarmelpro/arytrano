/**
 * Server-only surface of the `favorites` feature.
 *
 * Re-exports the Prisma-backed queries / services. Importing this
 * file from a Client Component is a compile error (modules import
 * `'server-only'`).
 *
 * RSC pages should `import { ... } from '@/features/favorites/server'`.
 */
export { getFavoritedListingIds } from './queries/get-favorited-listing-ids'
export { listUserFavorites } from './queries/list-user-favorites'
