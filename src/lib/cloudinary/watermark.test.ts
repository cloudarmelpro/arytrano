import { describe, it, expect } from 'vitest'
import { applyCloudinaryWatermark, maybeWatermark } from './watermark'

const BASE_URL =
  'https://res.cloudinary.com/arytrano/image/upload/v123456/arytrano/listings/abc/img.webp'

describe('applyCloudinaryWatermark', () => {
  it('injects the text transformation right after /image/upload/', () => {
    const out = applyCloudinaryWatermark(BASE_URL)
    expect(out).toContain('l_text:Open%20Sans_30_bold:AryTrano')
    expect(out).toMatch(
      /\/image\/upload\/l_text:Open%20Sans_30_bold:AryTrano,co_white,o_40,g_south_east,x_20,y_20\/v123456\//,
    )
  })

  it('is idempotent — a URL already watermarked passes through unchanged', () => {
    const once = applyCloudinaryWatermark(BASE_URL)
    const twice = applyCloudinaryWatermark(once)
    expect(twice).toBe(once)
  })

  it('returns non-Cloudinary URLs unchanged', () => {
    const foreign = 'https://example.com/image.jpg'
    expect(applyCloudinaryWatermark(foreign)).toBe(foreign)
  })

  it('preserves existing transformations after /upload/', () => {
    const withTransform =
      'https://res.cloudinary.com/arytrano/image/upload/w_400,c_fill/v123/x/y.webp'
    const out = applyCloudinaryWatermark(withTransform)
    // Watermark comes BEFORE the existing transform — Cloudinary applies
    // transformations in URL order, so the overlay sits behind the crop.
    // Acceptable for v0.5.
    expect(out).toContain('l_text:Open%20Sans_30_bold:AryTrano')
    expect(out).toContain('w_400,c_fill')
  })
})

describe('maybeWatermark', () => {
  it('applies the watermark only when the opt-in is true', () => {
    expect(maybeWatermark(BASE_URL, true)).toContain('l_text:Open%20Sans')
    expect(maybeWatermark(BASE_URL, false)).toBe(BASE_URL)
  })
})
