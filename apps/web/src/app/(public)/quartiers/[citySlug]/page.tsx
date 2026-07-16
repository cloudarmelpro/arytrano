import { permanentRedirect } from 'next/navigation'

/**
 * Fable-audit P2-5 (2026-07-02) — /quartiers/[citySlug] used to render
 * its own city-quartiers hub (map + blocks + jump + quiz CTA). It
 * competed with /villes/[citySlug] for the same "logement étudiant
 * {city}" queries and split internal PageRank between two indexable
 * geo hubs per city.
 *
 * Since /villes/[citySlug] is the money page (city landing with
 * CityHero + CityListings + CityQuartiersGrid + Place JSON-LD), the
 * shorter /quartiers/{city} URL is now a 308 alias — mirrors the
 * pattern already used by /quartiers/{city}/{slug} → /villes/{city}/
 * quartiers/{slug}.
 *
 * The 308 preserves method + tells Google to consolidate signals.
 */
export default async function ShortCityRedirect({
  params,
}: {
  params: Promise<{ citySlug: string }>
}) {
  const { citySlug } = await params
  permanentRedirect(`/villes/${citySlug}`)
}
