/**
 * Escape characters that have meaning in HTML so a user-supplied string
 * cannot break out of its container and inject script/markup.
 * Used in transactional emails where we interpolate User.name, listing
 * titles, etc.
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

export function escapeHtml(unsafe: string): string {
  return unsafe.replace(/[&<>"'`/=]/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch)
}
