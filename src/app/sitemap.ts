import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'
import { listSitemapListings } from '@/features/listings/queries/list-sitemap-listings'

export const revalidate = 3600 // regenerate hourly

// Frozen lastModified for static marketing pages. Using `new Date()` here
// would update the value on every regeneration even though the content
// is identical, which pollutes Google's freshness signals. Bump this
// constant manually when the static content actually changes.
const STATIC_PAGES_LAST_MODIFIED = '2026-05-19'

/**
 * Sitemap dual-language: every public URL is listed twice — once at the
 * default path (FR) and once at the `/mg/...` mirror (MG). Each entry's
 * `alternates.languages` tells Google these are language alternates of
 * the same canonical content (matches the hreflang tags we emit in page
 * metadata).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const staticLastMod = new Date(STATIC_PAGES_LAST_MODIFIED)

  const listings = await listSitemapListings()

  function languages(path: string) {
    return {
      'fr-MG': `${baseUrl}${path}`,
      mg: `${baseUrl}/mg${path}`,
    }
  }

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: staticLastMod,
      changeFrequency: 'daily',
      priority: 1,
      alternates: { languages: languages('/') },
    },
    {
      url: `${baseUrl}/annonces`,
      lastModified: staticLastMod,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: languages('/annonces') },
    },
    {
      url: `${baseUrl}/quartiers`,
      lastModified: staticLastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: languages('/quartiers') },
    },
    {
      url: `${baseUrl}/comment-ca-marche`,
      lastModified: staticLastMod,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: { languages: languages('/comment-ca-marche') },
    },
    {
      url: `${baseUrl}/proprietaires`,
      lastModified: staticLastMod,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: { languages: languages('/proprietaires') },
    },
  ]

  for (const l of listings) {
    const path = `/${l.citySlug}/${l.neighborhoodSlug}/${l.slug}`
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: l.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: { languages: languages(path) },
    })
  }

  return entries
}
