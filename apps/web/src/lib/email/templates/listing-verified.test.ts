import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { buildListingVerifiedEmail } from './listing-verified'

const baseData = {
  recipientName: 'Rakoto',
  listingTitle: 'Studio meublé à Andrainjato',
  listingUrl: 'https://arytrano.com/fianarantsoa/andrainjato/studio-x1y',
}

describe('buildListingVerifiedEmail', () => {
  it('renders FR with the verified-badge mention', () => {
    const out = buildListingVerifiedEmail('fr-MG', baseData)
    expect(out.subject).toMatch(/vérifiée/)
    expect(out.html).toContain('Bonjour Rakoto')
    expect(out.html).toMatch(/Annonce vérifiée/)
  })

  it('renders MG version', () => {
    const out = buildListingVerifiedEmail('mg', baseData)
    expect(out.subject).toMatch(/Voamarina/)
    expect(out.html).toMatch(/Filazana voamarina/)
  })

  it('escapes user-supplied values', () => {
    const out = buildListingVerifiedEmail('fr-MG', {
      ...baseData,
      recipientName: '<script>alert(1)</script>',
    })
    expect(out.html).not.toContain('<script>')
    expect(out.html).toContain('&lt;script&gt;')
  })

  it('text variant strips HTML', () => {
    const out = buildListingVerifiedEmail('fr-MG', baseData)
    expect(out.text).not.toMatch(/<[^>]+>/)
  })
})
