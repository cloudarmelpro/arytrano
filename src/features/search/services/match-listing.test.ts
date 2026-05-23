import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { matchesSavedSearch } = await import('./match-listing')

const base: import('./match-listing').ListingForMatching = {
  type: 'STUDIO',
  priceMonthlyMGA: 250_000,
  title: 'Studio meublé à Andrainjato',
  description: 'Studio lumineux, calme, proche fac.',
  amenities: ['WIFI', 'PARKING'],
  city: { slug: 'fianarantsoa' },
  neighborhood: { slug: 'andrainjato' },
}

describe('matchesSavedSearch', () => {
  it('returns true for an empty filter (no constraints)', () => {
    expect(matchesSavedSearch(base, {})).toBe(true)
  })

  it('matches on type', () => {
    expect(matchesSavedSearch(base, { type: 'STUDIO' })).toBe(true)
    expect(matchesSavedSearch(base, { type: 'HOUSE' })).toBe(false)
  })

  it('matches on city + neighborhood', () => {
    expect(
      matchesSavedSearch(base, {
        city: 'fianarantsoa',
        neighborhood: 'andrainjato',
      }),
    ).toBe(true)
    expect(matchesSavedSearch(base, { neighborhood: 'anjoma' })).toBe(false)
  })

  it('priceMin/priceMax bounds are inclusive', () => {
    expect(
      matchesSavedSearch(base, { priceMin: 250_000, priceMax: 250_000 }),
    ).toBe(true)
    expect(matchesSavedSearch(base, { priceMin: 250_001 })).toBe(false)
    expect(matchesSavedSearch(base, { priceMax: 249_999 })).toBe(false)
  })

  it('amenities use hasEvery semantics', () => {
    expect(matchesSavedSearch(base, { amenities: ['WIFI'] })).toBe(true)
    expect(matchesSavedSearch(base, { amenities: ['WIFI', 'PARKING'] })).toBe(
      true,
    )
    // Listing doesn't have GENERATOR — required, so fail
    expect(matchesSavedSearch(base, { amenities: ['WIFI', 'GENERATOR'] })).toBe(
      false,
    )
  })

  it('q matches case-insensitive against title OR description', () => {
    expect(matchesSavedSearch(base, { q: 'studio' })).toBe(true)
    expect(matchesSavedSearch(base, { q: 'CALME' })).toBe(true) // in description
    expect(matchesSavedSearch(base, { q: 'piscine' })).toBe(false)
  })

  it('combines filters with AND', () => {
    expect(
      matchesSavedSearch(base, {
        type: 'STUDIO',
        city: 'fianarantsoa',
        priceMax: 300_000,
        amenities: ['WIFI'],
      }),
    ).toBe(true)
    // Right type, wrong city
    expect(
      matchesSavedSearch(base, {
        type: 'STUDIO',
        city: 'antananarivo',
      }),
    ).toBe(false)
  })

  it('treats empty amenities array as "no constraint" (no rejection)', () => {
    expect(matchesSavedSearch(base, { amenities: [] })).toBe(true)
  })
})
