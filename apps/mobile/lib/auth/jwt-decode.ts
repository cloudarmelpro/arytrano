/**
 * Local JWT payload decoder — no verification (the server side already
 * verified the signature on every protected request; we just want to
 * read `sub` and `role` locally to avoid an extra `/users/me` round-trip
 * for things like the leases list role indicator).
 *
 * Returns null on any parse failure so callers can fall back to
 * fetching the profile if the token shape is unexpected.
 */
export type AccessTokenPayload = {
  sub: string
  role?: 'STUDENT' | 'OWNER' | 'ADMIN'
  exp?: number
}

function base64UrlDecode(input: string): string | null {
  try {
    // Pad to length multiple of 4, then map base64url → base64.
    const padLen = (4 - (input.length % 4)) % 4
    const padded = input + '='.repeat(padLen)
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
    return globalThis.atob(base64)
  } catch {
    return null
  }
}

export function decodeAccessToken(token: string): AccessTokenPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const payload = base64UrlDecode(parts[1] ?? '')
  if (!payload) return null
  try {
    const parsed = JSON.parse(payload) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'sub' in parsed &&
      typeof (parsed as { sub: unknown }).sub === 'string'
    ) {
      const p = parsed as Record<string, unknown>
      const role = typeof p.role === 'string' ? p.role : undefined
      const exp = typeof p.exp === 'number' ? p.exp : undefined
      return {
        sub: p.sub as string,
        role:
          role === 'STUDENT' || role === 'OWNER' || role === 'ADMIN'
            ? role
            : undefined,
        exp,
      }
    }
    return null
  } catch {
    return null
  }
}
