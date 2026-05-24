import { describe, it, expect, vi } from 'vitest'
import crypto from 'node:crypto'

vi.mock('server-only', () => ({}))

// Synthetic 32-byte key so the helpers boot without a real .env.
// `vi.hoisted` runs before any other module imports, so we have to
// re-import crypto inside the factory (the file-scope import isn't
// initialised yet at hoist time).
const hoisted = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require('node:crypto') as typeof import('node:crypto')
  return { TEST_KEY_BASE64: nodeCrypto.randomBytes(32).toString('base64') }
})

vi.mock('@/lib/env', () => ({
  env: {
    PII_ENCRYPTION_KEY: hoisted.TEST_KEY_BASE64,
    NODE_ENV: 'test',
  },
}))

import {
  encryptPii,
  decryptPii,
  isPiiKeyConfigured,
  PiiKeyMissingError,
} from './pii-encryption'

describe('encryptPii / decryptPii', () => {
  it('round-trips a small buffer losslessly', () => {
    const plain = Buffer.from('hello CIN bytes', 'utf8')
    const enc = encryptPii(plain)
    const dec = decryptPii(enc)
    expect(dec.equals(plain)).toBe(true)
  })

  it('round-trips a binary image-sized buffer', () => {
    const plain = crypto.randomBytes(64 * 1024) // 64 KB
    const enc = encryptPii(plain)
    const dec = decryptPii(enc)
    expect(dec.equals(plain)).toBe(true)
  })

  it('produces a different IV on every call (probabilistic uniqueness)', () => {
    const plain = Buffer.from('same plaintext')
    const a = encryptPii(plain)
    const b = encryptPii(plain)
    expect(a.iv.equals(b.iv)).toBe(false)
    expect(a.ciphertext.equals(b.ciphertext)).toBe(false)
  })

  it('refuses to decrypt a tampered ciphertext (GCM auth tag catches it)', () => {
    const plain = Buffer.from('integrity check')
    const enc = encryptPii(plain)
    const tampered = Buffer.from(enc.ciphertext)
    tampered[0] = tampered[0] ^ 0xff
    expect(() =>
      decryptPii({ ...enc, ciphertext: tampered }),
    ).toThrow()
  })

  it('refuses to decrypt with a tampered auth tag', () => {
    const plain = Buffer.from('integrity check')
    const enc = encryptPii(plain)
    const tag = Buffer.from(enc.authTag)
    tag[0] = tag[0] ^ 0xff
    expect(() =>
      decryptPii({ ...enc, authTag: tag }),
    ).toThrow()
  })

  it('rejects unknown key versions', () => {
    const plain = Buffer.from('forward compat')
    const enc = encryptPii(plain)
    expect(() => decryptPii({ ...enc, keyVersion: 99 })).toThrow(
      /key version/i,
    )
  })

  it('isPiiKeyConfigured returns true when the env key decodes to 32 bytes', () => {
    expect(isPiiKeyConfigured()).toBe(true)
  })

  it('exports a typed error for missing key — useful for graceful 503 in services', () => {
    expect(PiiKeyMissingError).toBeDefined()
    expect(new PiiKeyMissingError().name).toBe('PiiKeyMissingError')
  })
})
