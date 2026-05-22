import { permanentRedirect } from 'next/navigation'

/**
 * E-T07 multi-ville : `/quartiers` is no longer a real page — every
 * quartiers index lives under `/quartiers/<citySlug>`. We 308 to the
 * default city (Fianarantsoa, the v0.5 launch base) so existing
 * bookmarks + inbound links keep working.
 *
 * Once multi-city ships in production we can swap the default city
 * for whichever has the most inventory, or detect the visitor's
 * geo + redirect to the nearest seeded city.
 */
export default function QuartiersIndexRedirect() {
  permanentRedirect('/quartiers/fianarantsoa')
}
