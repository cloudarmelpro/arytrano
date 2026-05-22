import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

export type CityTab = {
  slug: string
  nameFr: string
  nameMg: string
  /** PUBLISHED listing count — drives the badge + the "no inventory" greyed state. */
  count: number
}

/**
 * Pills row above /annonces (and any other listings index) so a
 * visitor can switch the city filter without touching URL params.
 *
 * The "All" tab clears `?city=`; each city pill carries `?city=<slug>`
 * while preserving every OTHER query param (type, price, sort,
 * amenities). Switching city DROPS the stale neighborhood slug + the
 * pagination cursor (slugs are unique per city; cursor belongs to the
 * previous filtered set).
 *
 * Server Component — pure rendering. The active pill is highlighted
 * via `aria-current="page"` + a visual variant. Pills with 0 listings
 * stay clickable but render in a muted state to telegraph "no
 * inventory yet" without hiding the city (owners need to know they
 * CAN list there).
 */
export function CityTabs({
  locale,
  cities,
  activeCitySlug,
  totalCount,
  currentParams,
}: {
  locale: Locale
  cities: CityTab[]
  /** The currently selected `?city=` value, or null when filter is off. */
  activeCitySlug: string | null
  /** Sum of counts across all cities — shown on the "All" pill. */
  totalCount: number
  /** Current URL search params (minus city + neighborhood). Preserved across pills. */
  currentParams: URLSearchParams
}) {
  const t = getT(locale)

  function hrefFor(nextCity: string | null): string {
    const next = new URLSearchParams(currentParams)
    next.delete('cursor')
    if (nextCity) next.set('city', nextCity)
    else next.delete('city')
    const qs = next.toString()
    return qs ? `/annonces?${qs}` : '/annonces'
  }

  return (
    <section
      aria-label={t('annonces.cityTabs.aria')}
      className="flex flex-col gap-3 rounded-2xl bg-muted/40 p-4 sm:flex-row sm:items-center sm:gap-5"
    >
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {t('annonces.cityTabs.eyebrow')}
      </span>
      <nav className="flex flex-wrap gap-2">
        <Pill
          href={hrefFor(null)}
          label={t('annonces.cityTabs.all')}
          count={totalCount}
          active={activeCitySlug === null}
          empty={false}
        />
        {cities.map((city) => (
          <Pill
            key={city.slug}
            href={hrefFor(city.slug)}
            label={locale === 'mg' ? city.nameMg : city.nameFr}
            count={city.count}
            active={activeCitySlug === city.slug}
            empty={city.count === 0}
          />
        ))}
      </nav>
    </section>
  )
}

function Pill({
  href,
  label,
  count,
  active,
  empty,
}: {
  href: string
  label: string
  count: number
  active: boolean
  empty: boolean
}) {
  // Active state always wins on contrast — the primary fill makes the
  // current city obvious even when its count is 0.
  const baseClasses =
    'inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition'
  const variant = active
    ? 'bg-primary text-primary-foreground'
    : empty
      ? 'border border-border bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      : 'border border-border bg-background text-foreground hover:bg-muted'
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`${baseClasses} ${variant}`}
    >
      <span>{label}</span>
      <span
        className={`font-mono text-[11px] ${
          active ? 'text-primary-foreground/80' : 'text-muted-foreground'
        }`}
      >
        {count}
      </span>
    </Link>
  )
}
