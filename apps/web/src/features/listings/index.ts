export {
  createListingSchema,
  updateListingSchema,
  listingIdSchema,
  listingTypeSchema,
  amenitySchema,
  type CreateListingInput,
  type UpdateListingInput,
} from './schemas'
// Component + matching data shape. Re-exporting the type alongside the
// component keeps the consumer ergonomics simple: `import { PublicListingCard,
// type PublicListingCardData } from '@/features/listings'`. The type re-export
// stays client-safe (erased at compile) even though it originates from a
// `'server-only'` query module.
export type { PublicListingCard as PublicListingCardData } from './queries/list-public-listings'
export { PublicListingCard } from './components/PublicListingCard'
// Client-safe component re-exports for consumers in app/ + cross-feature.
export { PhotoGallery } from './components/PhotoGallery'
export { PhotoManager } from './components/PhotoManager'
export { ContactButtons } from './components/ContactButtons'
export { ShareButton } from './components/ShareButton'
export { ListingMapClient } from './components/ListingMapClient'
export {
  ListingsMapClient,
  type MapListing,
} from './components/ListingsMapClient'
export { ListingsViewToggle } from './components/ListingsViewToggle'
export { VerifiedListingBadge } from './components/VerifiedListingBadge'
export { ListingStatusBadge } from './components/ListingStatusBadge'
export { ListingForm } from './components/ListingForm'
export { ListingActions } from './components/ListingActions'
export { ListingActionsMenu } from './components/ListingActionsMenu'
export { ListingFiltersSidebar } from './components/ListingFiltersSidebar'
export { ListingSearchToolbar } from './components/ListingSearchToolbar'
export { UnifiedToolbar } from './components/UnifiedToolbar'
export { ListingSortButtons } from './components/ListingSortButtons'
export { ActiveFiltersChips } from './components/ActiveFiltersChips'
export { ResultsSearchStrip } from './components/ResultsSearchStrip'
// CityTabs intentionally NOT re-exported here. It's a Server Component
// that imports `getT` (server-only path) — surfacing it via the barrel
// poisons every Client Component bundle that touches the barrel.
// Server pages import directly from `./components/CityTabs` if they need it.
export { AMENITY_CATALOG, AmenityIcon } from './amenities'
