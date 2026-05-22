import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

export type CityTab = {
  slug: string
  nameFr: string
  nameMg: string
}

/**
 * Pills row above /annonces (and any other listings index) so a
 * visitor can switch the city filter without touching URL params.
 *
 * The "All" tab clears `?city=`; each city pill carries `?city=<slug>`
 * while preserving every OTHER query param (type, price, sort,
 * amenities, neighborhood). Switching city naturally invalidates the
 * neighborhood filter — a neighborhood slug is unique only per city,
 * so we DROP it when changing city to avoid a no-result trap.
 *
 * Server Component — pure rendering. The active pill is highlighted
 * via `aria-current="page"` + a visual variant.
 */
export function CityTabs({
  locale,
  cities,
  activeCitySlug,
  currentParams,
}: {
  locale: Locale
  cities: CityTab[]
  /** The currently selected `?city=` value, or null when filter is off. */
  activeCitySlug: string | null
  /** Current URL search params (minus city + neighborhood). Preserved across pills. */
  currentParams: URLSearchParams
}) {
  const t = getT(locale)

  function hrefFor(nextCity: string | null): string {
    const next = new URLSearchParams(currentParams)
    // Wipe pagination cursor when changing city — old cursor IDs
    // belong to listings of the previous city's filtered set.
    next.delete('cursor')
    if (nextCity) next.set('city', nextCity)
    else next.delete('city')
    const qs = next.toString()
    return qs ? `/annonces?${qs}` : '/annonces'
  }

  return (
    <nav
      aria-label={t('annonces.cityTabs.aria')}
      className="flex flex-wrap gap-2"
    >
      <Pill
        href={hrefFor(null)}
        label={t('annonces.cityTabs.all')}
        active={activeCitySlug === null}
      />
      {cities.map((city) => (
        <Pill
          key={city.slug}
          href={hrefFor(city.slug)}
          label={locale === 'mg' ? city.nameMg : city.nameFr}
          active={activeCitySlug === city.slug}
        />
      ))}
    </nav>
  )
}

function Pill({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex h-9 items-center rounded-full px-4 text-[13px] font-semibold transition ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted/60 text-foreground hover:bg-muted'
      }`}
    >
      {label}
    </Link>
  )
}
