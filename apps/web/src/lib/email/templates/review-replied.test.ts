import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { buildReviewRepliedEmail } from './review-replied'

const baseData = {
  recipientName: 'Hery',
  listingTitle: 'Studio meublé à Andrainjato',
  listingUrl: 'https://arytrano.com/fianarantsoa/andrainjato/studio-x1y',
  ownerDisplayName: 'Rakoto',
  responseExcerpt: 'Merci pour ton retour, je note pour la prochaine fois.',
}

describe('buildReviewRepliedEmail', () => {
  it('renders FR with owner name in subject + excerpt in body', () => {
    const out = buildReviewRepliedEmail('fr-MG', baseData)
    expect(out.subject).toMatch(/Rakoto a répondu/)
    expect(out.html).toContain('Bonjour Hery')
    expect(out.html).toContain('Merci pour ton retour')
    expect(out.html).toContain('Studio meublé à Andrainjato')
  })

  it('renders MG version', () => {
    const out = buildReviewRepliedEmail('mg', baseData)
    expect(out.subject).toMatch(/Rakoto/)
    expect(out.html).toContain('Salama Hery')
  })

  it('escapes user-controlled fields (owner name, excerpt, title)', () => {
    const out = buildReviewRepliedEmail('fr-MG', {
      ...baseData,
      ownerDisplayName: '<b>spam</b>',
      responseExcerpt: '<img src=x onerror=alert(1)>',
      listingTitle: '"><script>alert(2)</script>',
    })
    expect(out.html).not.toContain('<b>spam')
    expect(out.html).not.toContain('onerror=')
    expect(out.html).not.toContain('<script>alert(2)')
    expect(out.html).toContain('&lt;b&gt;')
    expect(out.html).toContain('&lt;script&gt;')
  })

  it('plain text variant has no HTML', () => {
    const out = buildReviewRepliedEmail('fr-MG', baseData)
    expect(out.text).not.toMatch(/<[^>]+>/)
  })
})
