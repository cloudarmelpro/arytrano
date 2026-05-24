import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { buildCinResultEmail } from './cin-result'

const baseData = {
  recipientName: 'Rakoto',
  dashboardUrl: 'https://arytrano.test/dashboard/verify-owner',
}

describe('buildCinResultEmail · approved', () => {
  it('FR: positive subject + verified badge mention', () => {
    const out = buildCinResultEmail('fr-MG', 'approved', baseData)
    expect(out.subject).toMatch(/vérifiée/)
    expect(out.html).toContain('Bonjour Rakoto')
    expect(out.html).toContain('Propriétaire vérifié')
  })

  it('MG: renders the malagasy version', () => {
    const out = buildCinResultEmail('mg', 'approved', baseData)
    expect(out.subject).toMatch(/Voamarina/)
    expect(out.html).toContain('Salama Rakoto')
  })

  it('escapes XSS in recipient name', () => {
    const out = buildCinResultEmail('fr-MG', 'approved', {
      ...baseData,
      recipientName: '<script>alert(1)</script>',
    })
    expect(out.html).not.toContain('<script>')
    expect(out.html).toContain('&lt;script&gt;')
  })

  it('text variant carries no HTML', () => {
    const out = buildCinResultEmail('fr-MG', 'approved', baseData)
    expect(out.text).not.toMatch(/<[^>]+>/)
  })
})

describe('buildCinResultEmail · rejected', () => {
  it('FR: includes the rejection reason verbatim (after escape)', () => {
    const out = buildCinResultEmail('fr-MG', 'rejected', {
      ...baseData,
      rejectionReason: 'Photo trop floue, refais avec plus de lumière.',
    })
    expect(out.subject).toMatch(/refusée/)
    expect(out.html).toContain('Photo trop floue')
  })

  it('MG: rejected variant + reason', () => {
    const out = buildCinResultEmail('mg', 'rejected', {
      ...baseData,
      rejectionReason: 'Sary tsy mazava.',
    })
    expect(out.subject).toMatch(/Tsy nekena/)
    expect(out.html).toContain('Sary tsy mazava')
  })

  it('escapes the rejection reason (admin could include weird chars)', () => {
    const out = buildCinResultEmail('fr-MG', 'rejected', {
      ...baseData,
      rejectionReason: '<img src=x onerror=alert(1)>',
    })
    expect(out.html).not.toContain('onerror=')
    expect(out.html).toContain('&lt;img')
  })
})
