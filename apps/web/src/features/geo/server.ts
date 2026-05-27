/**
 * `@/features/geo/server` — server-only entry point.
 *
 * Memory rule `feedback_feature_index_client_safe` : the public
 * `index.ts` barrel must never re-export `'server-only'` modules.
 * Queries (which import `prisma` + `'server-only'`) live here ; the
 * client-safe Zod schemas + parsers + types stay on `./index.ts`.
 */
export {
  listCitiesWithNeighborhoods,
  type CityWithNeighborhoods,
} from './queries/list-cities-with-neighborhoods'
