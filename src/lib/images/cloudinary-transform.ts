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
