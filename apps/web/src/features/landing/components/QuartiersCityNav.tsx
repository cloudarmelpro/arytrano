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
      className="border-b border-border bg-muted/40"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:gap-5 lg:px-10">
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t('quartiers.cityNav.aria')}
        </span>
        <nav className="flex flex-wrap gap-2">
          {cities.map((city) => {
            const active = city.slug === activeCitySlug
            const empty = city.quartierCount === 0
            const label = locale === 'mg' ? city.nameMg : city.nameFr
            return (
              <Link
                key={city.slug}
                href={`/quartiers/${city.slug}`}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : empty
                      ? 'border border-border bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      : 'border border-border bg-background text-foreground hover:bg-muted'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`font-mono text-[11px] ${
                    active
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground'
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
