import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'
import { listSitemapListings } from '@/features/listings/queries/list-sitemap-listings'

export const revalidate = 3600 // regenerate hourly

/**
 * Sitemap dual-language: every public URL is listed twice — once at the
 * default path (FR) and once at the `/mg/...` mirror (MG). Each entry's
 * `alternates.languages` tells Google these are language alternates of
 * the same canonical content (matches the hreflang tags we emit in page
 * metadata).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const now = new Date()

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
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
      alternates: { languages: languages('/') },
    },
    {
      url: `${baseUrl}/annonces`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: languages('/annonces') },
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
