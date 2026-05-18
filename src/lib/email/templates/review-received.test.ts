import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { buildReviewReceivedEmail } from './review-received'

const baseData = {
  recipientName: 'Rakoto',
  listingTitle: 'Studio meublé à Andrainjato',
  reviewerDisplayName: 'Hery',
  rating: 4,
  reviewExcerpt: 'Logement clair, propriétaire sérieux.',
  listingUrl: 'https://arytrano.com/fianarantsoa/andrainjato/studio-x1y',
  verifiedStay: false,
}

describe('buildReviewReceivedEmail', () => {
  it('renders FR with star pattern and excerpt', () => {
    const out = buildReviewReceivedEmail('fr-MG', baseData)
    expect(out.subject).toMatch(/Nouvel avis/)
    expect(out.html).toContain('Hery')
    expect(out.html).toContain('Logement clair')
    expect(out.html).toContain('★★★★☆') // 4/5
  })

  it('adds the "séjour confirmé" tag when verifiedStay is true', () => {
    const out = buildReviewReceivedEmail('fr-MG', {
      ...baseData,
      verifiedStay: true,
    })
    expect(out.html).toMatch(/séjour confirmé/)
    expect(out.text).toMatch(/séjour confirmé/)
  })

  it('renders MG version when locale is mg', () => {
    const out = buildReviewReceivedEmail('mg', baseData)
    expect(out.subject).toMatch(/Hevitra vaovao/)
    expect(out.html).toContain('Salama Rakoto')
  })

  it('escapes reviewer name and excerpt (HTML injection guard)', () => {
    const out = buildReviewReceivedEmail('fr-MG', {
      ...baseData,
      reviewerDisplayName: '<b>spam</b>',
      reviewExcerpt: '<img src=x onerror=alert(1)>',
    })
    expect(out.html).not.toContain('<b>spam')
    expect(out.html).not.toContain('onerror=')
    expect(out.html).toContain('&lt;b&gt;')
  })
})
