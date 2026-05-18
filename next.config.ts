import type { NextConfig } from 'next'

/**
 * Static security headers. The Content-Security-Policy itself is set
 * dynamically per-request in `src/proxy.ts` (nonce-based — see Next 16
 * `content-security-policy.md`). Anything that's safe to bake in once at
 * build time stays here.
 */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      // Allow profile photos and listing photos up to ~6MB after multipart overhead.
      // Service-side validation still caps individual files at 5MB.
      bodySizeLimit: '8mb',
      // CSRF defence — explicit allowlist for production domain. Next.js
      // already enforces same-origin by default, so dev (localhost) and the
      // bare apex are safe out of the box; this entry makes sure any
      // reverse-proxy / Vercel preview / www. subdomain combo is intentional.
      allowedOrigins: ['arytrano.com', 'www.arytrano.com'],
    },
  },
  images: {
    // Cloudinary delivery URLs
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    // AVIF first (~20-30% smaller than WebP on supported browsers — Chrome
    // Android is the bulk of our Madagascar traffic), WebP fallback.
    formats: ['image/avif', 'image/webp'],
    // Cloudinary URLs are content-addressed (URL changes when the asset
    // changes), so the Next image-optimization layer can cache aggressively.
    // 1 year = browser/CDN won't re-request unless we rebuild.
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
