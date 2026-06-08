import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')

  // Disallow paths for both default (FR) and `/mg/` mirror so Malagasy
  // URLs for auth/dashboard/admin don't get indexed either.
  // Additions over time :
  //   - /u/         (T-045 unsubscribe tokens — sensitive + ephemeral)
  //   - Note: `/api/cron/` is intentionally NOT listed — `/api/` already
  //     covers all sub-routes per the robots.txt spec.
  const privatePaths = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/auth-error',
    // SEO audit cleanup (2026-06-08) — `/dashboard/` alone covers the
    // index page AND all sub-routes per the robots.txt spec
    // (`Disallow: /dashboard/` matches `/dashboard`, `/dashboard/x`,
    // etc). The earlier duplicate `/dashboard` + `/dashboard/` pair
    // was harmless but ambiguous.
    '/dashboard/',
    '/api/',
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
