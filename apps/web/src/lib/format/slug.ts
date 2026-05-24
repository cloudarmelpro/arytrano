/**
 * Generate a URL-safe slug from a title + a short stable suffix.
 * Pattern: `chambre-etudiante-andrainjato-cmp3a2b1` (suffix = last 8 chars of cuid).
 * Stable across edits of the title because the suffix is derived from the id.
 *
 * Diacritics are stripped via NFD decomposition + the combining-marks range
 * U+0300..U+036F (escaped as \u to avoid source-encoding pitfalls).
 */
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g')

export function buildSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^a-z0-9\s-]/g, '')     // keep alnum / space / hyphen
    .trim()
    .replace(/\s+/g, '-')             // spaces -> hyphens
    .replace(/-+/g, '-')              // collapse hyphens
    .slice(0, 80)
    .replace(/^-|-$/g, '')            // trim leading/trailing hyphens

  const suffix = id.slice(-8)
  return base ? `${base}-${suffix}` : suffix
}
