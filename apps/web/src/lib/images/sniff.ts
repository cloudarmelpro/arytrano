import 'server-only'
import { fileTypeFromBuffer } from 'file-type'

/**
 * Allowlist of raster image formats we accept on uploads. SVG is intentionally
 * absent (script-XSS surface). The list mirrors `SAFE_RASTER_FORMATS` in
 * `lib/cloudinary/` — keep them in sync.
 */
export const SAFE_IMAGE_EXTS = ['jpg', 'png', 'webp', 'heic', 'heif'] as const
export type SafeImageExt = (typeof SAFE_IMAGE_EXTS)[number]

export type SniffResult =
  | { ok: true; ext: SafeImageExt; mime: string }
  | { ok: false; reason: 'unknown' | 'not_image' | 'blocked_format' }

/**
 * Read the first bytes of a buffer and check the real file format against
 * our raster allowlist. Defence against polyglot uploads where the client
 * sends `Content-Type: image/jpeg` for an HTML / SVG / PDF / executable file.
 *
 * Runs before the Cloudinary transfer so we can reject early — important
 * on slow connections (Madagascar 3G): a fake 5MB JPEG no longer travels.
 */
export async function sniffImage(buffer: Buffer): Promise<SniffResult> {
  const detected = await fileTypeFromBuffer(buffer)
  if (!detected) return { ok: false, reason: 'unknown' }

  if (!detected.mime.startsWith('image/')) {
    return { ok: false, reason: 'not_image' }
  }

  if (!(SAFE_IMAGE_EXTS as readonly string[]).includes(detected.ext)) {
    return { ok: false, reason: 'blocked_format' }
  }

  return { ok: true, ext: detected.ext as SafeImageExt, mime: detected.mime }
}
