import { describe, it, expect } from 'vitest'
import { withUtm, tagLinks } from './utm'

describe('withUtm', () => {
  it('appends utm params to an absolute URL', () => {
    const out = withUtm('https://arytrano.com/annonces', {
      source: 'email',
      medium: 'digest',
      campaign: 'weekly-owner',
    })
    expect(out).toContain('utm_source=email')
    expect(out).toContain('utm_medium=digest')
    expect(out).toContain('utm_campaign=weekly-owner')
  })

  it('preserves an existing query string', () => {
    const out = withUtm('https://arytrano.com/annonces?city=fianarantsoa', {
      source: 'facebook',
      medium: 'social',
    })
    expect(out).toContain('city=fianarantsoa')
    expect(out).toContain('utm_source=facebook')
  })

  it('overwrites conflicting utm keys', () => {
    const out = withUtm('https://arytrano.com/?utm_source=old', {
      source: 'new',
      medium: 'test',
    })
    expect(out).toContain('utm_source=new')
    expect(out).not.toContain('utm_source=old')
  })

  it('preserves a relative path shape', () => {
    const out = withUtm('/dashboard/listings', { source: 'email', medium: 'digest' })
    expect(out.startsWith('/dashboard/listings?')).toBe(true)
    expect(out).toContain('utm_source=email')
  })

  it('still returns a string even when the URL is malformed', () => {
    // The relative-path fallback prepends the site origin, so we
    // just assert we didn't throw and got a string back.
    const out = withUtm('ht^tp://[[bad', { source: 'x', medium: 'y' })
    expect(typeof out).toBe('string')
  })
})

describe('tagLinks', () => {
  it('tags every string value with the same UTM', () => {
    const links = tagLinks(
      { home: '/', pricing: '/pricing', kept: 42 as unknown as string },
      { source: 'email', medium: 'digest' },
    )
    expect(links.home).toContain('utm_source=email')
    expect(links.pricing).toContain('utm_source=email')
    expect(links.kept).toBe(42)
  })
})
