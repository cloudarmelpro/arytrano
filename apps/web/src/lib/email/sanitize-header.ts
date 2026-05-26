/**
 * Strip control characters that would let a hostile name break out of
 * the Subject (or any other email header) into arbitrary email fields.
 *
 * Targets — beyond the obvious CR/LF SMTP header injection:
 *   - tab               some MTAs interpret as folding whitespace
 *   - NULL byte         Postgres rejects in JSONB; corrupts subjects
 *   - U+2028 / U+2029   Unicode line / paragraph separators some
 *                       SMTP libraries treat as CRLF
 *
 * Caps the output to 120 chars to keep Subject within typical client
 * preview width.
 *
 * Memory rule `feedback_email_header_injection` — strip CRLF/tab from
 * user-supplied values before they flow into Subject/To/Cc headers.
 */

// Constructed via `new RegExp` so the source stays readable (no
// embedded control characters in the file). The double-backslash in
// the string literal escapes to single-backslash unicode escapes
// passed to the RegExp engine.
const HEADER_UNSAFE = new RegExp('[\\r\\n\\t\\u0000\\u2028\\u2029]+', 'g')

export function sanitizeEmailHeaderValue(raw: string): string {
  return raw.replace(HEADER_UNSAFE, ' ').trim().slice(0, 120)
}
