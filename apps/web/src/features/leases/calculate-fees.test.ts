import { describe, it, expect } from 'vitest'
import { calculateLeaseFees } from './calculate-fees'

describe('calculateLeaseFees', () => {
  it('returns signature fee only when caution is zero', () => {
    const fees = calculateLeaseFees({ cautionMGA: 0 })
    expect(fees).toEqual({
      signatureFeeMGA: 15_000,
      cautionCommissionMGA: 0,
      totalMGA: 15_000,
    })
  })

  it('charges 8% commission on a 500 000 Ar caution → 40 000 Ar (matches marketing example)', () => {
    const fees = calculateLeaseFees({ cautionMGA: 500_000 })
    expect(fees).toEqual({
      signatureFeeMGA: 15_000,
      cautionCommissionMGA: 40_000,
      totalMGA: 55_000,
    })
  })

  it('floors fractional commission to keep total ≤ visible amount', () => {
    // 100_001 × 0.08 = 8000.08 → floored to 8000
    const fees = calculateLeaseFees({ cautionMGA: 100_001 })
    expect(fees.cautionCommissionMGA).toBe(8000)
    expect(fees.totalMGA).toBe(23_000)
  })

  it('handles large cautions without overflow (1M caution)', () => {
    const fees = calculateLeaseFees({ cautionMGA: 1_000_000 })
    expect(fees).toEqual({
      signatureFeeMGA: 15_000,
      cautionCommissionMGA: 80_000,
      totalMGA: 95_000,
    })
  })

  it('rejects negative caution', () => {
    expect(() => calculateLeaseFees({ cautionMGA: -1 })).toThrow(RangeError)
  })

  it('rejects non-integer caution (Ariary has no subunit)', () => {
    expect(() => calculateLeaseFees({ cautionMGA: 500_000.5 })).toThrow(
      RangeError,
    )
  })
})
