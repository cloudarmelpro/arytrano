/**
 * Server-only surface of the `cities` feature (E-T11).
 * RSC pages import these queries; client code never touches them.
 */
export {
  getCityLandingData,
  type CityLandingData,
} from './queries/get-city-landing-data'
export {
  getNeighborhoodLandingData,
  type NeighborhoodLandingData,
} from './queries/get-neighborhood-landing-data'
