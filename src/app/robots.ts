import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')

  // Disallow paths for both default (FR) and `/mg/` mirror so Malagasy
  // URLs for auth/dashboard/admin don't get indexed either.
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
    '/admin/',
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
