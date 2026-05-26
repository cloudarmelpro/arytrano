import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

export type QuartiersCityNavItem = {
  slug: string
  nameFr: string
  nameMg: string
  quartierCount: number
}

/**
 * City switcher pinned above the quartiers hero. Unlike the /annonces
 * CityTabs, this one is path-scoped (each pill is a `Link` to
 * `/quartiers/<slug>`) and has no "All" option — the quartiers index
 * is always scoped to one city by URL.
 *
 * Cities with 0 quartiers seeded render in a muted "outline" variant
 * but stay clickable (so owners + future-students see we'll cover
 * them soon).
 */
export function QuartiersCityNav({
  locale,
  cities,
  activeCitySlug,
}: {
  locale: Locale
  cities: QuartiersCityNavItem[]
  activeCitySlug: string
}) {
  const t = getT(locale)
  return (
    <section
      aria-label={t('quartiers.cityNav.aria')}
      className="bg-background"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-6 pt-6 pb-2 lg:flex-row lg:items-baseline lg:gap-8 lg:px-10 lg:pt-8">
        <span className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground">
          {t('quartiers.cityNav.aria')}
        </span>
        <nav className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {cities.map((city) => {
            const active = city.slug === activeCitySlug
            const empty = city.quartierCount === 0
            const label = locale === 'mg' ? city.nameMg : city.nameFr
            return (
              <Link
                key={city.slug}
                href={`/quartiers/${city.slug}`}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-baseline gap-1.5 text-[14px] font-semibold tracking-[-0.01em] transition ${
                  active
                    ? 'text-primary'
                    : empty
                      ? 'text-foreground/45 hover:text-foreground/70'
                      : 'text-foreground/65 hover:text-foreground'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    active ? 'text-primary/70' : 'text-foreground/40'
                  }`}
                >
                  {city.quartierCount}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </section>
  )
}
