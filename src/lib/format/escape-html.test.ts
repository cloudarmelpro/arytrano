import { describe, it, expect } from 'vitest'
import { escapeHtml } from './escape-html'

describe('escapeHtml', () => {
  it('escapes the OWASP-cheatsheet set (& < > " \' / ` =)', () => {
    expect(escapeHtml('&<>"\'/`=')).toBe(
      '&amp;&lt;&gt;&quot;&#39;&#x2F;&#x60;&#x3D;',
    )
  })

  it('neutralises a script-tag injection vector', () => {
    const out = escapeHtml('<script>alert(1)</script>')
    expect(out).not.toContain('<script>')
    expect(out).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;')
  })

  it('leaves safe characters untouched', () => {
    expect(escapeHtml('Studio meublé à Andrainjato — 250000 Ar')).toBe(
      'Studio meublé à Andrainjato — 250000 Ar',
    )
  })

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('')
  })
})
