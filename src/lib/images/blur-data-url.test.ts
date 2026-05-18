import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import sharp from 'sharp'
import { computeBlurDataURL } from './blur-data-url'

describe('computeBlurDataURL', () => {
  it('returns a base64 JPEG data URL', async () => {
    // Generate a minimal 100x100 red square in-memory (no fixtures needed).
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 220, g: 50, b: 50 },
      },
    })
      .jpeg()
      .toBuffer()

    const out = await computeBlurDataURL(buffer)

    expect(out).toMatch(/^data:image\/jpeg;base64,/)
    // The encoded payload must be non-trivially small but non-empty —
    // 16px @ q=20 lands somewhere in [200, 1500] bytes of base64.
    const base64 = out.slice('data:image/jpeg;base64,'.length)
    expect(base64.length).toBeGreaterThan(50)
    expect(base64.length).toBeLessThan(2000)
  })

  it('preserves the aspect ratio (wide landscape stays wide)', async () => {
    const buffer = await sharp({
      create: {
        width: 320,
        height: 80,
        channels: 3,
        background: { r: 0, g: 100, b: 200 },
      },
    })
      .jpeg()
      .toBuffer()

    const out = await computeBlurDataURL(buffer)
    const decoded = Buffer.from(
      out.slice('data:image/jpeg;base64,'.length),
      'base64',
    )
    const meta = await sharp(decoded).metadata()
    // 320x80 → constrained to 16px on the long edge → 16x4
    expect(meta.width).toBeLessThanOrEqual(16)
    expect(meta.height).toBeLessThanOrEqual(16)
    expect((meta.width ?? 0)).toBeGreaterThan(meta.height ?? 0)
  })
})
