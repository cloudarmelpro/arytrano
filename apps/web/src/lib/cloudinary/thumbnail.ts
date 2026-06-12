/**
 * Inject a Cloudinary delivery transformation into an upload URL.
 *
 * Cloudinary delivery URLs follow the pattern :
 *   https://res.cloudinary.com/<cloud>/image/upload/<TRANSFORMS>/v.../path.jpg
 *
 * `<TRANSFORMS>` is optional. To produce a thumbnail we insert one
 * after `/upload/` :
 *   .../upload/c_fill,w_96,h_96,q_auto,f_auto/v.../path.jpg
 *
 * Perf audit (2026-06-12) — the inventory and dispute admin views
 * were rendering the raw uploaded image (potentially 2-4 MB)
 * inside 48×48 thumbnails, wasting 99% of the bandwidth and
 * triggering measurable CLS on 3G.
 */

export type ThumbOptions = {
  width: number
  height: number
  /** `fill` crops, `fit` letterboxes ; default `fill` (avatar-style). */
  crop?: 'fill' | 'fit'
}

export function cloudinaryThumbnail(
  url: string,
  { width, height, crop = 'fill' }: ThumbOptions,
): string {
  if (!url.includes('/upload/')) return url
  const transform = [
    `c_${crop}`,
    `w_${width}`,
    `h_${height}`,
    'q_auto',
    'f_auto',
  ].join(',')
  // Idempotent — if a transform was already injected (URL contains
  // /upload/c_…), we leave it as-is rather than stacking transforms.
  if (/\/upload\/[a-z]_/.test(url)) return url
  return url.replace('/upload/', `/upload/${transform}/`)
}
