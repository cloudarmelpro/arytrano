import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { buildListingPublishedEmail } from './listing-published'

const baseData = {
  recipientName: 'Rakoto',
  listingTitle: 'Studio meublé à Andrainjato',
  listingUrl: 'https://arytrano.com/fianarantsoa/andrainjato/studio-meuble-x1y',
  dashboardUrl: 'https://arytrano.com/dashboard/listings',
}

describe('buildListingPublishedEmail', () => {
  it('renders FR by default for fr-MG', () => {
    const out = buildListingPublishedEmail('fr-MG', baseData)
    expect(out.subject).toMatch(/Studio meublé à Andrainjato/)
    expect(out.html).toContain('Bonjour Rakoto')
    expect(out.html).toContain('Studio meublé à Andrainjato')
    expect(out.text).toMatch(/^Bonjour Rakoto/)
    expect(out.text).toContain(baseData.listingUrl)
  })

  it('renders MG when locale is mg', () => {
    const out = buildListingPublishedEmail('mg', baseData)
    expect(out.subject).toMatch(/Voapetraka/)
    expect(out.html).toContain('Salama Rakoto')
  })

  it('escapes HTML-special chars in name and title (XSS guard)', () => {
    const out = buildListingPublishedEmail('fr-MG', {
      ...baseData,
      recipientName: '<script>alert(1)</script>',
      listingTitle: '"><img src=x onerror=alert(2)>',
    })
    expect(out.html).not.toContain('<script>')
    expect(out.html).not.toContain('onerror=')
    expect(out.html).toContain('&lt;script&gt;')
  })

  it('plain text has no HTML tags', () => {
    const out = buildListingPublishedEmail('fr-MG', baseData)
    expect(out.text).not.toMatch(/<[^>]+>/)
  })
})
