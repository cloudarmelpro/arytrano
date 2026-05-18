/**
 * Injects an "AryTrano" text watermark transformation into a Cloudinary
 * delivery URL (T-036). Reversible by storage — the original asset on
 * Cloudinary is untouched; the watermark is applied on-the-fly by URL.
 *
 * Strategy: parse the `/upload/` segment and insert a layer transformation
 * before any existing transformations / version. Idempotent — if the URL
 * already carries our `l_text:AryTrano` overlay, return it unchanged.
 *
 * Public-facing only — call this from public queries (PublicListingCard,
 * detail page, related). Owner / admin views should keep raw URLs so the
 * owner sees their photos as-uploaded.
 */
const UPLOAD_MARKER = '/image/upload/'

// Cloudinary text layer syntax — bottom-right placement, white at 40%
// opacity, Open Sans bold 30px. The font is part of Cloudinary's default
// font catalogue (no asset upload needed).
const WATERMARK_TRANSFORM =
  'l_text:Open%20Sans_30_bold:AryTrano,co_white,o_40,g_south_east,x_20,y_20'

export function applyCloudinaryWatermark(url: string): string {
  // Only handle the canonical Cloudinary delivery shape; foreign URLs
  // (or already-watermarked ones) pass through untouched.
  const idx = url.indexOf(UPLOAD_MARKER)
  if (idx === -1) return url
  if (url.includes('l_text:Open%20Sans_30_bold:AryTrano')) return url

  const head = url.slice(0, idx + UPLOAD_MARKER.length)
  const tail = url.slice(idx + UPLOAD_MARKER.length)
  return `${head}${WATERMARK_TRANSFORM}/${tail}`
}

/**
 * Sugar for the common "transform if opt-in, leave alone otherwise"
 * pattern in public queries:
 *
 *   url: maybeWatermark(row.url, listing.watermarkOptIn)
 */
export function maybeWatermark(url: string, optIn: boolean): string {
  return optIn ? applyCloudinaryWatermark(url) : url
}
