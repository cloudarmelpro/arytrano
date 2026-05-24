import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'
import { listSitemapListings } from '@/features/listings/server'
import { listCitiesWithCounts } from '@/features/landing/server'
import { prisma } from '@/lib/db'

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

  const [listings, cities, neighborhoods, freshnessRaw] = await Promise.all([
    listSitemapListings(),
    listCitiesWithCounts(),
    // For the per-quartier landing pages (E-T11 B2) we need the
    // (cityslug, neighborhoodslug) pairs. Light read — 37 rows at
    // launch — so no caching needed beyond the page-level
    // `revalidate = 3600`.
    prisma.neighborhood.findMany({
      select: {
        slug: true,
        city: { select: { slug: true } },
      },
    }),
    // E-T12 : real `lastmod` signal — MAX(publishedAt) over PUBLISHED
    // listings, grouped by (citySlug, neighborhoodSlug). One Prisma
    // query covers both city + quartier scopes via aggregation in
    // the loop below. Google uses this to schedule re-crawl after
    // an owner publishes a new annonce.
    prisma.listing.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        publishedAt: true,
        city: { select: { slug: true } },
        neighborhood: { select: { slug: true } },
      },
    }),
  ])

  // Reduce listings → freshness map keyed by both city and city+quartier.
  // We end up with two lookups : `maxPublishByCity[citySlug]` and
  // `maxPublishByQuartier[citySlug:slug]`.
  const maxPublishByCity = new Map<string, Date>()
  const maxPublishByQuartier = new Map<string, Date>()
  for (const row of freshnessRaw) {
    if (!row.publishedAt) continue
    const citySlug = row.city.slug
    const qKey = `${citySlug}:${row.neighborhood.slug}`
    const prevCity = maxPublishByCity.get(citySlug)
    if (!prevCity || row.publishedAt > prevCity) {
      maxPublishByCity.set(citySlug, row.publishedAt)
    }
    const prevQ = maxPublishByQuartier.get(qKey)
    if (!prevQ || row.publishedAt > prevQ) {
      maxPublishByQuartier.set(qKey, row.publishedAt)
    }
  }

  function languages(path: string) {
    return {
      // `x-default` tells Google what to serve when no language matches
      // — same value as fr-MG (broader audience than MG). Mirrors the
      // metadata-level `localeAlternates` helper so sitemap + page
      // <head> stay consistent.
      'x-default': `${baseUrl}${path}`,
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
  // on the landing or a direct search result. lastmod reflects the
  // most recent publish in that city.
  for (const city of cities) {
    const path = `/quartiers/${city.slug}`
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: maxPublishByCity.get(city.slug) ?? staticLastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: languages(path) },
    })
  }

  // E-T11 city landing : /villes (hub) + /villes/<citySlug>. SEO-prio
  // pages targeting "logement étudiant à {city}" keywords — slightly
  // higher priority (0.85) than /quartiers because they're the entry
  // funnel. lastmod = MAX publishedAt across the city so freshness
  // signals correctly when an owner publishes there.
  entries.push({
    url: `${baseUrl}/villes`,
    lastModified: staticLastMod,
    changeFrequency: 'weekly',
    priority: 0.85,
    alternates: { languages: languages('/villes') },
  })
  for (const city of cities) {
    const path = `/villes/${city.slug}`
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: maxPublishByCity.get(city.slug) ?? staticLastMod,
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: { languages: languages(path) },
    })
  }

  // E-T11 B2 neighborhood landing : /villes/<city>/quartiers/<n>.
  // Long-tail SEO ("location quartier Anosy" etc). Priority 0.75 —
  // lower than the city hub since each individual quartier page has
  // a narrower audience. lastmod = MAX publishedAt in the quartier.
  for (const n of neighborhoods) {
    const path = `/villes/${n.city.slug}/quartiers/${n.slug}`
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified:
        maxPublishByQuartier.get(`${n.city.slug}:${n.slug}`) ?? staticLastMod,
      changeFrequency: 'weekly',
      priority: 0.75,
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
