import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

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
      // 55MB = listing-video cap (50MB) + multipart envelope headroom.
      // The video stream still passes through the Vercel function and
      // counts against the function payload limit (Hobby 4.5MB, Pro
      // 32MB, Enterprise raisable). For Vercel Hobby this WILL fail
      // even with this bumped value — production needs Pro or higher
      // until we cut over to a client-direct upload.
      //
      // 2026-06-25 — stop-gap fix for the 8MB rejection on legit
      // walkthrough videos. Long-term roadmap : switch to a
      // client-direct upload (signed Cloudinary URL today, S3
      // pre-signed PUT after the asset migration to AWS) so the
      // file bypasses the function entirely.
      //
      // Photo + avatar uploads stay under this cap with room to spare.
      bodySizeLimit: '55mb',
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

// Sentry build-time integration (T-056).
//
// `withSentryConfig` wires up source-map upload during `next build`
// so production stack traces show real source code instead of
// minified gibberish. The upload requires SENTRY_AUTH_TOKEN +
// SENTRY_ORG + SENTRY_PROJECT — if any is missing, the upload step
// is silently skipped (dev + first deploys still build cleanly).
//
// The runtime SDK init happens in `src/instrumentation.ts` +
// `sentry.client.config.ts`, not here.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Keep build logs quiet unless the upload actually fails.
  silent: true,

  // Disable Sentry's auto-wrapping of the Vercel cron API since we use
  // our own protected /api/cron/* routes with explicit Sentry capture
  // where needed.
  automaticVercelMonitors: false,

  // Hide source map URLs from the client bundle — keeps them
  // server-side for Sentry but not exposed to visitors.
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
})
