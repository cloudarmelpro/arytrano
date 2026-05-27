// Public surface of the admin-geo feature.
//
// Queries are server-only; the action stays exported because the
// edit form imports it directly. No Client Components live here — the
// edit form is a separate file that combines this Action with shadcn
// primitives.
export { listGeoAdmin, type GeoAdminCity, type GeoAdminNeighborhood } from './queries/list-geo-admin'
export {
  getNeighborhoodForAdmin,
  type GeoAdminNeighborhoodDetail,
} from './queries/get-neighborhood-admin'
export {
  updateNeighborhoodEditorialAction,
  type UpdateEditorialActionState,
} from './actions/update-editorial'
export {
  createCityAction,
  type CreateCityActionState,
} from './actions/create-city'
export {
  createNeighborhoodAction,
  type CreateNeighborhoodActionState,
} from './actions/create-neighborhood'
export {
  updateNeighborhoodQuizProfileAction,
  type UpdateQuizProfileActionState,
} from './actions/update-quiz-profile'
