import 'server-only'
import crypto from 'node:crypto'
import { env } from '@/lib/env'

/**
 * AES-256-GCM encryption for OwnerProfile.cin (T-037).
 *
 * Why a separate helper from `lib/auth/totp.ts`:
 *  - TOTP plaintext is a base32 secret string; CIN plaintext is image
 *    bytes. Different shapes → different APIs.
 *  - TOTP key is derived from AUTH_SECRET (it's an app-level secret).
 *    CIN key is the dedicated `PII_ENCRYPTION_KEY`, scoped to identity
 *    documents so it can be rotated independently and revoked without
 *    invalidating session tokens.
 *
 * Storage shape: ciphertext, IV (12 bytes), and authTag (16 bytes) are
 * persisted as separate `Bytes` columns rather than concatenated into
 * a single blob — easier to debug, easier to migrate later if the
 * GCM parameters change. `keyVersion` is also stored so a future
 * rotation can decrypt old rows with the previous key.
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // GCM standard nonce size
const KEY_VERSION = 1 // bump on rotation, store the old key under V<n-1>

export class PiiKeyMissingError extends Error {
  constructor() {
    super(
      'PII_ENCRYPTION_KEY is not configured. Set it in .env (32-byte base64).',
    )
    this.name = 'PiiKeyMissingError'
  }
}

function getKey(version: number): Buffer {
  // Single-key mode for now. When rotation lands, switch on `version` and
  // resolve to the right env var (e.g. PII_ENCRYPTION_KEY_V2).
  if (version !== KEY_VERSION) {
    throw new Error(`Unsupported PII key version: ${version}`)
  }
  if (!env.PII_ENCRYPTION_KEY) {
    throw new PiiKeyMissingError()
  }
  const key = Buffer.from(env.PII_ENCRYPTION_KEY, 'base64')
  if (key.length !== 32) {
    throw new Error('PII_ENCRYPTION_KEY must decode to 32 bytes')
  }
  return key
}

export type EncryptedPii = {
  ciphertext: Buffer
  iv: Buffer
  authTag: Buffer
  keyVersion: number
}

export function encryptPii(plaintext: Buffer): EncryptedPii {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(KEY_VERSION), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const authTag = cipher.getAuthTag()
  return { ciphertext, iv, authTag, keyVersion: KEY_VERSION }
}

export function decryptPii(input: {
  ciphertext: Buffer
  iv: Buffer
  authTag: Buffer
  keyVersion: number
}): Buffer {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(input.keyVersion),
    input.iv,
  )
  decipher.setAuthTag(input.authTag)
  // `final()` throws if the auth tag doesn't match — guarantees the
  // ciphertext wasn't tampered with under the same IV.
  return Buffer.concat([decipher.update(input.ciphertext), decipher.final()])
}

/** Convenience for tests / boot — checks the key is configured + valid. */
export function isPiiKeyConfigured(): boolean {
  try {
    getKey(KEY_VERSION)
    return true
  } catch {
    return false
  }
}
