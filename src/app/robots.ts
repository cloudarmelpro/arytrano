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
