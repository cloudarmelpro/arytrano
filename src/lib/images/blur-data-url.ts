import 'server-only'
import sharp from 'sharp'

/**
 * Compute a tiny base64 JPEG data URL suitable for `next/image`'s
 * `blurDataURL` prop. Produces ~500-900 bytes of payload per photo,
 * stored once in `ListingPhoto.blurhash` and reused on every render —
 * eliminating the "blank flash" on slow Madagascar 3G connections.
 *
 * Why a base64 JPEG rather than the actual `blurhash` format string:
 *   - `next/image` only accepts data URLs; the blurhash format would
 *     need client-side decoding (extra JS + canvas work per card).
 *   - A 16×N JPEG at q=20 is smaller than the decoded RGBA from a
 *     blurhash anyway, and renders without any client cost.
 *
 * The column name in Prisma stays `blurhash` for backwards-compatibility
 * even though the content is technically a data URL (semantic drift
 * accepted to avoid a migration).
 */
export async function computeBlurDataURL(buffer: Buffer): Promise<string> {
  // Keep the placeholder microscopic — 16px on the long edge is plenty
  // for the blur effect. Aspect ratio is preserved via `fit: 'inside'`.
  const output = await sharp(buffer)
    .resize(16, 16, { fit: 'inside' })
    .jpeg({ quality: 20, mozjpeg: true })
    .toBuffer()
  return `data:image/jpeg;base64,${output.toString('base64')}`
}
