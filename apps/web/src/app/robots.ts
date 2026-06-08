import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')

  // Disallow paths for both default (FR) and `/mg/` mirror so Malagasy
  // URLs for auth/dashboard/admin don't get indexed either.
  // Additions over time :
  //   - /u/         (T-045 unsubscribe tokens — sensitive + ephemeral)
  //   - /api/cron/  (T-049/T-050 crons — protected by Bearer but we
  //                  don't want them crawled either)
  const privatePaths = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/auth-error',
    '/dashboard',
    '/dashboard/',
    '/api/',
    '/api/cron/',
    '/admin/',
    '/u/',
    // SEO audit C-2 (2026-05-29) — onboarding wizard is auth-gated
    // (T-049 owner terms acceptance). The page itself sets
    // `robots: { index: false }`, but a hard `Disallow` keeps Googlebot
    // from spending its crawl budget probing the route.
    '/onboarding/',
    // SEO audit C1 fix — GoalPay redirect targets carry a `?reference=`
    // query string. Even with per-page `robots: { index: false }`,
    // Googlebot can crawl URLs it finds via external backlinks (e.g.
    // the GoalPay dashboard's listing of merchant return URLs) and
    // expose them in Search Console with the reference visible.
    '/transaction/',
    '/test/',
    // Webhook S2S endpoint — never indexable, but a hard `Disallow`
    // also short-circuits crawlers from probing the stack fingerprint.
    '/webhook-gpay',
  ]
  const disallow = [...privatePaths, ...privatePaths.map((p) => `/mg${p}`)]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
