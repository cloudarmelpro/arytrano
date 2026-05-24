import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

export type CityQuartiersGridItem = {
  slug: string
  nameFr: string
  nameMg: string
  listingCount: number
}

/**
 * Quartiers grid on the city landing page. Each card links to the
 * city's quartiers index scoped to that quartier (future-proofing
 * for E-T11 B2 which will add per-quartier landing pages :
 * `/villes/<city>/quartiers/<quartier>`). For now we link to
 * `/annonces?city=X&neighborhood=Y` so the visitor sees listings
 * immediately.
 *
 * Quartiers with 0 listings still render (visible, muted) so owners
 * know we'll cover them when inventory arrives.
 */
export function CityQuartiersGrid({
  locale,
  cityName,
  citySlug,
  quartiers,
}: {
  locale: Locale
  cityName: string
  citySlug: string
  quartiers: CityQuartiersGridItem[]
}) {
  const t = getT(locale)
  if (quartiers.length === 0) return null
  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="mb-8">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('cityLanding.quartiers.eyebrow')}
          </span>
          <h2 className="mt-2 font-serif text-[clamp(28px,3.4vw,42px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
            {t('cityLanding.quartiers.title', { city: cityName })}
          </h2>
          <p className="mt-2 max-w-[560px] text-[14.5px] text-foreground/70">
            {t('cityLanding.quartiers.lead', {
              count: quartiers.length,
              city: cityName,
            })}
          </p>
        </header>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {quartiers.map((q) => {
            const label = locale === 'mg' ? q.nameMg : q.nameFr
            const isEmpty = q.listingCount === 0
            return (
              <li key={q.slug}>
                <Link
                  href={`/annonces?city=${citySlug}&neighborhood=${q.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-xl bg-background p-4 transition hover:bg-background/60"
                >
                  <span className="text-[14.5px] font-semibold text-foreground">
                    {label}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-mono ${
                      isEmpty
                        ? 'bg-muted/60 text-muted-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {isEmpty
                      ? t('cityLanding.quartiers.card.empty')
                      : t('cityLanding.quartiers.card.count', {
                          count: q.listingCount,
                        })}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
