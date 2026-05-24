import { describe, it, expect } from 'vitest'
import { formatAriary } from './currency'

// Intl.NumberFormat with locale 'fr-FR' uses U+202F (narrow no-break space)
// as the thousands separator. Express it explicitly here so the assertions
// don't accidentally match a regular space and silently regress if the
// locale's separator changes upstream.
const NNBSP = ' '

describe('formatAriary', () => {
  it('formats a small integer with narrow-no-break-space grouping and Ar suffix', () => {
    expect(formatAriary(250000)).toBe(`250${NNBSP}000 Ar`)
  })

  it('accepts numeric strings (Decimal-from-Prisma legacy path)', () => {
    expect(formatAriary('1500000')).toBe(`1${NNBSP}500${NNBSP}000 Ar`)
  })

  it('drops fraction digits (Ariary has no subunit)', () => {
    expect(formatAriary(123_456.78)).toBe(`123${NNBSP}457 Ar`)
  })

  it('handles zero', () => {
    expect(formatAriary(0)).toBe('0 Ar')
  })

  it('falls back to em-dash on NaN / empty input', () => {
    expect(formatAriary('not-a-number')).toBe('— Ar')
    expect(formatAriary(Number.NaN)).toBe('— Ar')
  })
})
