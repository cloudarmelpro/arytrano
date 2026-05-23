import 'server-only'
import type { Amenity, ListingType } from '@prisma/client'
import type { SavedSearchFilters } from '../schemas/saved-search'

/**
 * Pure predicate : does this listing satisfy every constraint in the
 * saved-search filter ? Mirrors the SQL WHERE clause in
 * `list-public-listings.ts` so the in-process matcher returns the
 * same result the visitor would get if they ran the search live.
 *
 * Used by `notify-saved-search-matches` on listing-publish events
 * to fan out push notifications. We evaluate in JS instead of running
 * a SQL query per saved-search because v1 volume is ~50 saved
 * searches × ~10 listings/publish — the JS loop is cheaper than
 * 50 round-trips to Postgres.
 *
 * Filters are AND-combined : every set constraint must match.
 * Undefined / empty filters are treated as "no constraint" → pass.
 */

export type ListingForMatching = {
  type: ListingType
  priceMonthlyMGA: number
  title: string
  description: string
  amenities: Amenity[]
  city: { slug: string }
  neighborhood: { slug: string }
}

export function matchesSavedSearch(
  listing: ListingForMatching,
  filters: SavedSearchFilters,
): boolean {
  if (filters.type && filters.type !== listing.type) return false
  if (filters.city && filters.city !== listing.city.slug) return false
  if (
    filters.neighborhood &&
    filters.neighborhood !== listing.neighborhood.slug
  )
    return false
  if (
    filters.priceMin !== undefined &&
    listing.priceMonthlyMGA < filters.priceMin
  )
    return false
  if (
    filters.priceMax !== undefined &&
    listing.priceMonthlyMGA > filters.priceMax
  )
    return false
  if (filters.amenities && filters.amenities.length > 0) {
    // hasEvery semantics — same as the Prisma WHERE clause.
    const set = new Set(listing.amenities)
    for (const required of filters.amenities) {
      if (!set.has(required as Amenity)) return false
    }
  }
  if (filters.q) {
    // ILIKE %q% — case-insensitive substring on title OR description.
    // No wildcard escaping needed here : the saved filter went
    // through the same Zod validation as the URL `q` param at write
    // time, AND we control the listing strings.
    const needle = filters.q.toLowerCase()
    const hay = `${listing.title}\n${listing.description}`.toLowerCase()
    if (!hay.includes(needle)) return false
  }
  return true
}
