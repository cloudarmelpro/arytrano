// `@/features/geo` is the CLIENT-SAFE barrel — Zod schemas, parsers,
// and types only. Server-only queries live in `./server.ts`. Memory
// rule `feedback_feature_index_client_safe` strictly enforces this :
// re-exporting a `'server-only'` value here would poison every client
// component that does `import type { ... } from '@/features/geo'`
// (those imports are erased today, but a single accidental value
// import flips the bundle inclusion).
//
// `CityWithNeighborhoods` is a type — types are erased at compile
// time so they stay safe on this barrel even though the underlying
// query is server-only.
export type { CityWithNeighborhoods } from './queries/list-cities-with-neighborhoods'
// E-T07 Batch B1 — JSONB shapes for Neighborhood.editorial + quizProfile.
// Pure Zod + types, no runtime side-effect (safe for client + server).
export {
  neighborhoodEditorialSchema,
  quartierQuizProfileSchema,
  parseEditorial,
  parseQuizProfile,
  type NeighborhoodEditorial,
  type QuartierQuizProfile,
} from './types'
