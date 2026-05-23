import { permanentRedirect } from 'next/navigation'

/**
 * 308-redirect to the canonical quartier landing under /villes/.
 *
 * Per-quartier content already lives at
 *   /villes/[citySlug]/quartiers/[neighborhoodSlug]
 * (E-T11 — has reviews, favorites awareness, Place + ItemList JSON-LD,
 * dedicated NeighborhoodHero/Map/Listings/Reviews components).
 *
 * This URL pattern (`/quartiers/<city>/<slug>`) is kept as a shorter,
 * more memorable alias — visitors who type or share the shorter URL
 * land on the rich page. 308 preserves the method and is the right
 * permanent-redirect signal for search engines (consolidates SEO
 * signal on the canonical URL, no duplicate-content split).
 */
export default async function ShortQuartierRedirect({
  params,
}: {
  params: Promise<{ citySlug: string; quartierSlug: string }>
}) {
  const { citySlug, quartierSlug } = await params
  permanentRedirect(`/villes/${citySlug}/quartiers/${quartierSlug}`)
}
