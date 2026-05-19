import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import type { NeighborhoodRow } from '../queries/list-neighborhoods-with-counts'

const DESCRIPTORS: Record<string, { tagline: MessageKey; landmark: MessageKey }> = {
  andrainjato: {
    tagline: 'landing.neighborhoods.andrainjato.tagline',
    landmark: 'landing.neighborhoods.andrainjato.landmark',
  },
  antarandolo: {
    tagline: 'landing.neighborhoods.antarandolo.tagline',
    landmark: 'landing.neighborhoods.antarandolo.landmark',
  },
  tsianolondroa: {
    tagline: 'landing.neighborhoods.tsianolondroa.tagline',
    landmark: 'landing.neighborhoods.tsianolondroa.landmark',
  },
  mahamanina: {
    tagline: 'landing.neighborhoods.mahamanina.tagline',
    landmark: 'landing.neighborhoods.mahamanina.landmark',
  },
  anjoma: {
    tagline: 'landing.neighborhoods.anjoma.tagline',
    landmark: 'landing.neighborhoods.anjoma.landmark',
  },
  ankidona: {
    tagline: 'landing.neighborhoods.ankidona.tagline',
    landmark: 'landing.neighborhoods.ankidona.landmark',
  },
  ambalavato: {
    tagline: 'landing.neighborhoods.ambalavato.tagline',
    landmark: 'landing.neighborhoods.ambalavato.landmark',
  },
  mahasoabe: {
    tagline: 'landing.neighborhoods.mahasoabe.tagline',
    landmark: 'landing.neighborhoods.mahasoabe.landmark',
  },
}

/**
 * "Explore Fianarantsoa par quartier" section (T-043). Renders every
 * seeded neighborhood as a clickable card linking to
 * `/annonces?neighborhood=<slug>`. Cards show the count of PUBLISHED
 * listings; ones at 0 display a soft "Bientôt" badge so the territorial
 * coverage is still visible (signals to students AND to owners that
 * the quartier is on the map).
 */
export function LandingNeighborhoods({
  locale,
  rows,
}: {
  locale: Locale
  rows: NeighborhoodRow[]
}) {
  const t = getT(locale)
  if (rows.length === 0) return null
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-20">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              {t('landing.neighborhoods.title')}
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t('landing.neighborhoods.lead')}
            </p>
          </div>
          <Link
            href="/annonces"
            className="text-sm font-medium text-primary transition hover:text-primary/80"
          >
            {t('landing.neighborhoods.viewAll')}
          </Link>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((n) => (
            <NeighborhoodCard
              key={n.id}
              slug={n.slug}
              label={locale === 'mg' ? n.nameMg : n.nameFr}
              count={n.publishedListings}
              t={t}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}

function NeighborhoodCard({
  slug,
  label,
  count,
  t,
}: {
  slug: string
  label: string
  count: number
  t: ReturnType<typeof getT>
}) {
  const descriptor = DESCRIPTORS[slug]
  return (
    <li>
      <Link
        href={`/annonces?neighborhood=${slug}`}
        className="group flex h-full flex-col gap-1.5 rounded-xl bg-muted/40 p-5 transition hover:bg-primary/5"
      >
        <span className="text-base font-semibold text-foreground transition group-hover:text-primary">
          {label}
        </span>
        {descriptor && (
          <span className="text-xs text-foreground/70">
            {t(descriptor.tagline)} · {t(descriptor.landmark)}
          </span>
        )}
        {count > 0 ? (
          <span className="text-xs text-muted-foreground">
            {t(
              count <= 1
                ? 'landing.neighborhoods.count.one'
                : 'landing.neighborhoods.count.other',
              { count },
            )}
          </span>
        ) : (
          <span className="inline-flex w-fit items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('landing.neighborhoods.soon')}
          </span>
        )}
      </Link>
    </li>
  )
}
