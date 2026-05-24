import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { buildReportReceivedEmail } from './report-received'

const baseData = {
  recipientName: 'Rakoto',
  listingTitle: 'Studio meublé à Andrainjato',
  listingUrl: 'https://arytrano.com/fianarantsoa/andrainjato/studio-x1y',
  reasonLabel: 'Arnaque suspectée',
}

describe('buildReportReceivedEmail', () => {
  it('renders FR with the reason but never the raw details', () => {
    const out = buildReportReceivedEmail('fr-MG', baseData)
    expect(out.subject).toMatch(/Signalement reçu/)
    expect(out.html).toContain('Bonjour Rakoto')
    expect(out.html).toContain('Arnaque suspectée')
    // Sanity check: the template owns no `details` slot — there's no way
    // for caller-supplied free text to flow into the email body.
    expect(out.html).not.toMatch(/details/i)
  })

  it('renders MG when locale is mg', () => {
    const out = buildReportReceivedEmail('mg', baseData)
    expect(out.subject).toMatch(/Filazana/)
    expect(out.html).toContain('Salama Rakoto')
  })

  it('escapes HTML-special chars in user-controlled fields', () => {
    const out = buildReportReceivedEmail('fr-MG', {
      ...baseData,
      recipientName: '<script>alert(1)</script>',
      listingTitle: '"><img src=x onerror=alert(2)>',
    })
    expect(out.html).not.toContain('<script>')
    expect(out.html).not.toContain('onerror=')
    expect(out.html).toContain('&lt;script&gt;')
  })

  it('plain text variant carries no HTML', () => {
    const out = buildReportReceivedEmail('fr-MG', baseData)
    expect(out.text).not.toMatch(/<[^>]+>/)
  })
})
