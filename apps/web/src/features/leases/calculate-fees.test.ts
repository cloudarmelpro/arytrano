import { describe, it, expect } from 'vitest'
import { calculatePlatformFee } from './calculate-fees'

describe('calculatePlatformFee', () => {
  it('returns 20% of the monthly rent on a typical Madagascar rental', () => {
    // 500 000 Ar/month × 20% = 100 000 Ar
    const fees = calculatePlatformFee({ monthlyRentMGA: 500_000 })
    expect(fees).toEqual({ platformFeeMGA: 100_000 })
  })

  it('floors fractional fees to keep the charge ≤ the visible percentage', () => {
    // 100 001 × 0.20 = 20 000.2 → floored to 20 000
    const fees = calculatePlatformFee({ monthlyRentMGA: 100_001 })
    expect(fees.platformFeeMGA).toBe(20_000)
  })

  it('returns 0 for a 0 monthly rent (free listing edge case)', () => {
    const fees = calculatePlatformFee({ monthlyRentMGA: 0 })
    expect(fees).toEqual({ platformFeeMGA: 0 })
  })

  it('handles a 1 000 000 Ar rent without overflow', () => {
    const fees = calculatePlatformFee({ monthlyRentMGA: 1_000_000 })
    expect(fees).toEqual({ platformFeeMGA: 200_000 })
  })

  it('rejects a negative monthlyRent', () => {
    expect(() => calculatePlatformFee({ monthlyRentMGA: -1 })).toThrow(
      RangeError,
    )
  })

  it('rejects a non-integer monthlyRent (Ariary has no subunit)', () => {
    expect(() =>
      calculatePlatformFee({ monthlyRentMGA: 500_000.5 }),
    ).toThrow(RangeError)
  })
})
