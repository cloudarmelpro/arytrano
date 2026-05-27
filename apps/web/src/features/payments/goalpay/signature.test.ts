import { describe, it, expect, vi } from 'vitest'
import { createHmac } from 'node:crypto'

// `signature.ts` imports `server-only` which throws in Node test env.
// Stub it to a noop — the test runs in pure Node, the import is for
// safety in production bundling only.
vi.mock('server-only', () => ({}))

import { verifyGoalPaySignature } from './signature'

const SECRET = 'whsec_test_abc123_long_enough_for_hmac'

function signBody(body: string, secret: string = SECRET): string {
  return createHmac('sha256', secret).update(body).digest('hex')
}

describe('verifyGoalPaySignature', () => {
  it('accepts a valid HMAC-SHA256 signature over the exact raw body', () => {
    const body = '{"event":"payment.success","data":{"amount":15000}}'
    const sig = signBody(body)
    expect(verifyGoalPaySignature(body, sig, SECRET)).toBe(true)
  })

  it('rejects a signature when the body has been tampered with', () => {
    const original = '{"event":"payment.success","data":{"amount":15000}}'
    const tampered = '{"event":"payment.success","data":{"amount":99999}}'
    const sig = signBody(original)
    expect(verifyGoalPaySignature(tampered, sig, SECRET)).toBe(false)
  })

  it('rejects a signature signed with the wrong secret', () => {
    const body = '{"event":"payment.failed"}'
    const sig = signBody(body, 'wrong_secret')
    expect(verifyGoalPaySignature(body, sig, SECRET)).toBe(false)
  })

  it('returns false when the signature header is null', () => {
    const body = '{"event":"payment.success"}'
    expect(verifyGoalPaySignature(body, null, SECRET)).toBe(false)
  })

  it('returns false when the signature header is empty string', () => {
    const body = '{"event":"payment.success"}'
    expect(verifyGoalPaySignature(body, '', SECRET)).toBe(false)
  })

  it('returns false when the signature is not valid hex', () => {
    const body = '{"event":"payment.success"}'
    expect(
      verifyGoalPaySignature(body, 'not-hex-zzzz-not-a-signature', SECRET),
    ).toBe(false)
  })

  it('returns false when the signature length differs from expected', () => {
    const body = '{"event":"payment.success"}'
    // Too short — half the expected HMAC-SHA256 hex length (64).
    expect(verifyGoalPaySignature(body, 'aabbcc', SECRET)).toBe(false)
  })

  it('returns false when the secret is empty (audit C2 — fail-closed on misconfigured env)', () => {
    const body = '{"event":"payment.success"}'
    const sig = signBody(body, '')
    expect(verifyGoalPaySignature(body, sig, '')).toBe(false)
  })

  it('returns false when the secret is shorter than 16 chars (audit C2 — defense-in-depth)', () => {
    const body = '{"event":"payment.success"}'
    const shortSecret = 'short'
    const sig = signBody(body, shortSecret)
    expect(verifyGoalPaySignature(body, sig, shortSecret)).toBe(false)
  })

  it('uses timing-safe comparison (truthy on identical bytes via Buffer)', () => {
    // Sanity: the function does NOT use === on hex strings (which would
    // be timing-vulnerable). We can't directly observe timing in a unit
    // test, but we assert correctness on equal-length-wrong-content
    // inputs, which is what the timing-safe path handles specifically.
    const body = 'a'
    const correct = signBody(body)
    const wrongSameLength = 'f'.repeat(correct.length)
    expect(verifyGoalPaySignature(body, wrongSameLength, SECRET)).toBe(false)
  })
})
