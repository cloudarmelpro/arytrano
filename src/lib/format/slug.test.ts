import { describe, it, expect } from 'vitest'
import { buildSlug } from './slug'

describe('buildSlug', () => {
  it('lowercases, strips diacritics, and appends the id suffix', () => {
    // Suffix is the LAST 8 chars of the id ('b1xy0001').
    expect(buildSlug('Studio meublé à Andrainjato', 'cmp3a2b1xy0001')).toBe(
      'studio-meuble-a-andrainjato-b1xy0001',
    )
  })

  it('collapses repeated whitespace into single hyphens', () => {
    expect(buildSlug('  Chambre   propre  ', 'abcdefgh12345678')).toBe(
      'chambre-propre-12345678',
    )
  })

  it('strips non-alphanumeric punctuation', () => {
    expect(buildSlug('Belle maison! (3 pièces)', 'abcdefgh99999999')).toBe(
      'belle-maison-3-pieces-99999999',
    )
  })

  it('truncates the base to 80 chars before appending suffix', () => {
    const long = 'a'.repeat(120)
    const out = buildSlug(long, 'abcdef99')
    // 80 a's + dash + the last-8 of the id (full id is already 8 chars).
    expect(out).toBe('a'.repeat(80) + '-abcdef99')
    // Structural invariant: suffix is always the trailing 8 chars of the id.
    expect(out.endsWith('-abcdef99')).toBe(true)
  })

  it('returns just the suffix when the title has no valid characters', () => {
    // Title is fully stripped → base empty → output skips the leading dash
    // and is just the last 8 chars of the id ("cuid0000").
    expect(buildSlug('!@#$%', 'cmp3a2b1cuid0000')).toBe('cuid0000')
  })
})
