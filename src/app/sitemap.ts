import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'
import { listSitemapListings } from '@/features/listings/server'
import { listCitiesWithCounts } from '@/features/landing/server'

export const revalidate = 3600 // regenerate hourly

// Frozen lastModified for static marketing pages. Using `new Date()` here
// would update the value on every regeneration even though the content
// is identical, which pollutes Google's freshness signals. Bump this
// constant manually when the static content actually changes.
const STATIC_PAGES_LAST_MODIFIED = '2026-05-20'

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

  const [listings, cities] = await Promise.all([
    listSitemapListings(),
    listCitiesWithCounts(),
  ])

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
    // /quartiers itself now 308-redirects to the default city
    // (E-T07). Indexable URLs live at /quartiers/<citySlug> — those
    // are added dynamically below.
    {
      url: `${baseUrl}/quartiers/quiz`,
      lastModified: staticLastMod,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: languages('/quartiers/quiz') },
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
    ...['/legal/terms', '/legal/privacy', '/legal/cookies', '/legal/mentions'].map(
      (path) => ({
        url: `${baseUrl}${path}`,
        lastModified: staticLastMod,
        changeFrequency: 'yearly' as const,
        priority: 0.3,
        alternates: { languages: languages(path) },
      }),
    ),
  ]

  // E-T07 multi-ville : each city gets its own /quartiers/<citySlug>
  // page. Priority slightly lower than the (deprecated) /quartiers
  // index since visitors typically reach these via the CitySelect
  // on the landing or a direct search result.
  for (const city of cities) {
    const path = `/quartiers/${city.slug}`
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: staticLastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: languages(path) },
    })
  }

  // E-T11 city landing : /villes/<citySlug>. SEO-prio pages targeting
  // "logement étudiant à {city}" keywords — slightly higher priority
  // (0.85) than /quartiers because they're the entry funnel.
  for (const city of cities) {
    const path = `/villes/${city.slug}`
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: staticLastMod,
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: { languages: languages(path) },
    })
  }

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
