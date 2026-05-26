export {
  listCitiesWithNeighborhoods,
  type CityWithNeighborhoods,
} from './queries/list-cities-with-neighborhoods'
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
