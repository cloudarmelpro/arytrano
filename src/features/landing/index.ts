/**
 * Public surface of the landing feature. Each section is its own RSC
 * (server-side rendered) or a thin client island. The page route
 * (`src/app/(public)/page.tsx`) imports from here.
 */
export { LandingTopBar } from './components/LandingTopBar'
export { LandingHero } from './components/LandingHero'
export { LandingTrustStrip } from './components/LandingTrustStrip'
export { LandingHowItWorks } from './components/LandingHowItWorks'
export { LandingNeighborhoods } from './components/LandingNeighborhoods'
export { LandingFeatured } from './components/LandingFeatured'
export { LandingOwnerBlock } from './components/LandingOwnerBlock'
export { LandingTestimonials } from './components/LandingTestimonials'
export { LandingFaq } from './components/LandingFaq'
export { QuartiersHero } from './components/QuartiersHero'
export { QuartiersMap } from './components/QuartiersMap'
export { QuartiersJump } from './components/QuartiersJump'
export { QuartiersBlocks } from './components/QuartiersBlocks'
export { QuartiersQuizCta } from './components/QuartiersQuizCta'
export type { NeighborhoodOption } from './components/LandingSearchCard'
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
