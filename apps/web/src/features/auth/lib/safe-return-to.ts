import 'server-only'

/**
 * Validate a `returnTo` redirect target to prevent open-redirect attacks.
 *
 * Allowed : same-origin relative paths starting with a single `/`.
 * Rejected :
 *   - Empty / null
 *   - Protocol-relative URLs (`//evil.com/...`) — would redirect away
 *   - Absolute URLs (`https://evil.com/...`)
 *   - Anything containing `://` anywhere
 *   - Anything starting with the auth-page paths (would loop)
 *
 * Returns the sanitized path on success, or null when the input is
 * unsafe — caller falls back to a safe default like `/dashboard`.
 */
export function sanitizeReturnTo(input: string | null | undefined): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (!trimmed.startsWith('/')) return null
  if (trimmed.startsWith('//')) return null
  if (trimmed.includes('://')) return null
  // Reject backslashes (Windows path attempt) and newlines (header
  // injection — defensive even though Next sanitizes Location).
  if (/[\\\r\n]/.test(trimmed)) return null
  // Don't loop back through sign-in / sign-up.
  if (
    trimmed === '/sign-in' ||
    trimmed.startsWith('/sign-in/') ||
    trimmed === '/sign-up' ||
    trimmed.startsWith('/sign-up/')
  ) {
    return null
  }
  return trimmed
}
