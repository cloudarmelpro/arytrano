/**
 * Strip Unicode characters that can spoof the visual order of text
 * in a PDF — RTL/LTR overrides, embedding marks, isolates, BOM.
 *
 * A hostile user.name containing U+202E (Right-to-Left Override)
 * would visually reverse what follows in the rendered PDF, letting
 * an attacker make the tenant block look like the owner block (or
 * worse, swap signatures in the eye of a non-careful reader). Since
 * the lease PDF is a legal document we sanitize aggressively.
 *
 * Audit fix 2026-06-12.
 */

// U+202A LEFT-TO-RIGHT EMBEDDING, U+202B RTL EMBEDDING,
// U+202C POP DIRECTIONAL FORMATTING, U+202D LRO, U+202E RLO,
// U+2066-U+2069 isolates, U+200E LRM, U+200F RLM, U+FEFF BOM,
// plus the CRLF/tab/LSEP/PSEP family (same as email sanitize).
const PDF_TEXT_UNSAFE = new RegExp(
  '[\\r\\n\\t\\u0000\\u200E\\u200F\\u202A-\\u202E\\u2066-\\u2069\\u2028\\u2029\\uFEFF]+',
  'g',
)

export function sanitizePdfText(raw: string): string {
  return raw.replace(PDF_TEXT_UNSAFE, ' ').trim()
}
