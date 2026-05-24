/**
 * Cloudinary URL transformation helper for the mobile client.
 *
 * Audit P0 : `<Image source={{ uri }}>` with a bare Cloudinary upload
 * URL downloads the original full-resolution asset (1200-4000 px,
 * 200 KB - 2 MB) for a 360-dp slot. Adding a transform reduces
 * thumbnails to ~15 KB and detail-gallery to ~60 KB.
 *
 * URL pattern : `https://res.cloudinary.com/<cloud>/image/upload/<transform>/<public_id>`
 * The transform slot lives between `/upload/` and the public_id.
 *
 * `c_fill` crops to the requested dimensions ; `f_webp` ships WebP
 * on supported clients ; `q_75` is the right quality / size tradeoff
 * for thumbnails on 3G.
 */

const UPLOAD_MARKER = '/image/upload/'

function withTransform(url: string, transform: string): string {
  const idx = url.indexOf(UPLOAD_MARKER)
  if (idx === -1) return url // not a Cloudinary URL — pass through
  const before = url.slice(0, idx + UPLOAD_MARKER.length)
  const after = url.slice(idx + UPLOAD_MARKER.length)
  return `${before}${transform}/${after}`
}

/** ~360x270 logical px slot (4:3 card). */
export function cloudinaryThumb(url: string): string {
  return withTransform(url, 'c_fill,w_400,h_300,f_webp,q_75')
}

/** Detail screen gallery — full-width, ~360x270 on a typical phone. */
export function cloudinaryDetail(url: string): string {
  return withTransform(url, 'c_fill,w_800,h_600,f_webp,q_80')
}
