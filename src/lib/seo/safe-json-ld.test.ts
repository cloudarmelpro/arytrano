import { describe, it, expect } from 'vitest'
import { safeJsonLd } from './safe-json-ld'

// U+2028 / U+2029 are JS line terminators — they're built via String.fromCharCode
// rather than embedded as source literals because some parsers (oxc, in
// particular) refuse to lex regex / string literals that contain them.
const LINE_SEP = String.fromCharCode(0x2028)
const PARA_SEP = String.fromCharCode(0x2029)

describe('safeJsonLd', () => {
  it('escapes `<` so an embedded `</script>` cannot close the host tag', () => {
    const malicious = { name: 'Closer </script><img src=x onerror=alert(1)>' }
    const out = safeJsonLd(malicious)
    expect(out).not.toContain('</script>')
    expect(out).toContain('\\u003c/script>')
  })

  it('escapes U+2028 / U+2029 (JS-but-not-JSON line terminators)', () => {
    const value = { body: `line1${LINE_SEP}line2${PARA_SEP}line3` }
    const out = safeJsonLd(value)
    // Raw chars would crash JS parsers reading the inline script body.
    expect(out).not.toContain(LINE_SEP)
    expect(out).not.toContain(PARA_SEP)
    expect(out).toContain('\\u2028')
    expect(out).toContain('\\u2029')
  })

  it('round-trips clean values unchanged (no false-positive escapes)', () => {
    const value = { a: 1, b: 'hello', c: [true, null] }
    expect(JSON.parse(safeJsonLd(value))).toEqual(value)
  })
})
