/**
 * Public surface of the `landing` feature (client-safe).
 *
 * Components only — RSC and Client islands. The DB queries live on
 * `@/features/landing/server` so a Client Component importing from
 * this barrel can never accidentally pull in `'server-only'` code.
 *
 * The page route (`src/app/(public)/page.tsx`) imports from both
 * surfaces as needed.
 */
export { LandingHero } from './components/LandingHero'
export { LandingTrustStrip } from './components/LandingTrustStrip'
export { LandingHowItWorks } from './components/LandingHowItWorks'
export { LandingNeighborhoods } from './components/LandingNeighborhoods'
export { LandingFeatured } from './components/LandingFeatured'
export { LandingFinalCta } from './components/LandingFinalCta'
export { LandingFaq } from './components/LandingFaq'
export { QuartiersHero } from './components/QuartiersHero'
export {
  QuartiersCityNav,
  type QuartiersCityNavItem,
} from './components/QuartiersCityNav'
export { QuartiersMap } from './components/QuartiersMap'
export { QuartiersJump } from './components/QuartiersJump'
export { QuartiersBlocks } from './components/QuartiersBlocks'
export { QuartiersQuizCta } from './components/QuartiersQuizCta'
export type {
  NeighborhoodOption,
  CityOption,
} from './components/LandingSearchCard'
