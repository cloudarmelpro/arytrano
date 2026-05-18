import { describe, it, expect } from 'vitest'
import { createListingSchema } from './create-listing'

const validBase = {
  title: 'Studio meublé à Andrainjato',
  description: 'Logement clair, proche fac. Toutes commodités. ',
  type: 'STUDIO',
  priceMonthlyMGA: 250_000,
  cityId: 'cm-fianarantsoa',
  neighborhoodId: 'nb-andrainjato',
}

describe('createListingSchema', () => {
  it('accepts a valid minimal listing', () => {
    const r = createListingSchema.safeParse(validBase)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.amenities).toEqual([])
      expect(r.data.customAmenities).toEqual([])
      expect(r.data.furnished).toBe(false)
    }
  })

  it('rejects titles with control characters (SMTP header injection guard)', () => {
    const r = createListingSchema.safeParse({
      ...validBase,
      title: 'Studio\r\nBcc: victim@example.com',
    })
    expect(r.success).toBe(false)
  })

  it('coerces priceMonthlyMGA from string to integer', () => {
    const r = createListingSchema.safeParse({ ...validBase, priceMonthlyMGA: '250000' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.priceMonthlyMGA).toBe(250000)
  })

  it('rejects non-integer or non-positive prices', () => {
    const negative = createListingSchema.safeParse({ ...validBase, priceMonthlyMGA: -1 })
    expect(negative.success).toBe(false)

    const fractional = createListingSchema.safeParse({ ...validBase, priceMonthlyMGA: 12.5 })
    expect(fractional.success).toBe(false)

    const tooHigh = createListingSchema.safeParse({ ...validBase, priceMonthlyMGA: 100_000_001 })
    expect(tooHigh.success).toBe(false)
  })

  it('rejects more than 20 amenities or unknown amenity codes', () => {
    const tooMany = createListingSchema.safeParse({
      ...validBase,
      amenities: new Array(21).fill('WIFI'),
    })
    expect(tooMany.success).toBe(false)

    const unknown = createListingSchema.safeParse({
      ...validBase,
      amenities: ['WIFI', 'JACUZZI_AS_A_SERVICE'],
    })
    expect(unknown.success).toBe(false)
  })

  it('rejects custom amenities with control chars or out-of-bounds length', () => {
    const ctrl = createListingSchema.safeParse({
      ...validBase,
      customAmenities: ['Piscine\nchauffée'],
    })
    expect(ctrl.success).toBe(false)

    const tooLong = createListingSchema.safeParse({
      ...validBase,
      customAmenities: ['x'.repeat(61)],
    })
    expect(tooLong.success).toBe(false)

    const tooMany = createListingSchema.safeParse({
      ...validBase,
      customAmenities: new Array(11).fill('Chose'),
    })
    expect(tooMany.success).toBe(false)
  })

  it('coerces furnished string "true"/"false" into boolean', () => {
    const yes = createListingSchema.safeParse({ ...validBase, furnished: 'true' })
    expect(yes.success).toBe(true)
    if (yes.success) expect(yes.data.furnished).toBe(true)

    const no = createListingSchema.safeParse({ ...validBase, furnished: 'false' })
    expect(no.success).toBe(true)
    if (no.success) expect(no.data.furnished).toBe(false)
  })
})
