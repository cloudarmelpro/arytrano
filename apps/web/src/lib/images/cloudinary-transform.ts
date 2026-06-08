/**
 * Cloudinary URL transformation helpers for the web. Twin of
 * `apps/mobile/lib/cloudinary.ts` — same audit P0 / P1 motivation :
 * the DB stores the original upload URL, which can be 200KB-2MB,
 * far too big for thumbnail slots.
 *
 * Server-safe (no React, no DOM) — usable from Server Components,
 * Server Actions, REST handlers, or Client Components.
 */

const UPLOAD_MARKER = '/image/upload/'

function withTransform(url: string, transform: string): string {
  const idx = url.indexOf(UPLOAD_MARKER)
  if (idx === -1) return url // not a Cloudinary URL — pass through
  const before = url.slice(0, idx + UPLOAD_MARKER.length)
  const after = url.slice(idx + UPLOAD_MARKER.length)
  return `${before}${transform}/${after}`
}

/** Tiny 48–96 px overlay/panel thumbnail (map slide-in, etc.). */
export function cloudinaryPanelThumb(url: string): string {
  return withTransform(url, 'c_fill,w_96,h_96,f_webp,q_70')
}

/**
 * Listing card thumbnail — 800×600 WebP q_75. Performance audit H-2
 * (2026-05-29).
 *
 * Pre-fix the query layer returned the upload URL (max 1600×1200) so
 * the catalog cards downloaded ~250 KB per photo despite rendering at
 * ~400 px. Cloudinary's `c_fill,w_800,h_600,f_webp,q_75` rewrite cuts
 * the payload to ~30-50 KB while still serving crisp 2× retina (card
 * displays around 400 px CSS width). Aspect 4:3 matches the
 * `aspect-[4/3]` card frame.
 *
 * Apply at the query layer rather than in the React component so every
 * consumer (web cards, mobile app, REST API) automatically receives
 * the optimized URL — no risk of one consumer forgetting to pass it
 * through the transform helper.
 */
export function cloudinaryCardThumb(url: string): string {
  return withTransform(url, 'c_fill,w_800,h_600,f_webp,q_75')
}
