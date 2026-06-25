import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import { Icon } from '@/components/shared/Icon'
import type { NeighborhoodRow } from '../queries/list-neighborhoods-with-counts'
import { QUARTIER_DESCRIPTORS } from '../quartier-descriptors'

type Palette = { bg: string; fg: string }
const PALETTES: Palette[] = [
  { bg: 'oklch(0.88 0.040 277)', fg: 'oklch(0.32 0.08 277)' },
  { bg: 'oklch(0.84 0.060 277)', fg: 'oklch(0.30 0.10 277)' },
  { bg: 'oklch(0.80 0.090 277)', fg: 'oklch(0.28 0.12 277)' },
  { bg: 'oklch(0.72 0.110 277)', fg: '#ffffff' },
]

const SPANS: Array<{ col: number; row: number; feature?: boolean }> = [
  { col: 2, row: 2, feature: true },
  { col: 1, row: 1 },
  { col: 1, row: 2 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 1 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
]

export function LandingNeighborhoods({
  locale,
  rows,
}: {
  locale: Locale
  rows: NeighborhoodRow[]
}) {
  if (rows.length === 0) return null
  const t = getT(locale)
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-8">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
              {t('landing.neighborhoods.eyebrow' as MessageKey)}
            </span>
            <h2 className="mt-3 max-w-[620px] text-[clamp(32px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.018em] text-foreground">
              {t('landing.neighborhoods.title')}
            </h2>
            <p className="max-w-[540px] mt-3 text-[14.5px] text-foreground/70">
              {t('landing.neighborhoods.lead')}
            </p>
          </div>
          <Link
            href="/quartiers"
            className="inline-flex items-center text-[13px] font-medium text-foreground transition hover:text-primary mt-3"
          >
            {t('landing.neighborhoods.viewAll')}
          </Link>
        </header>

        <ul className="grid auto-rows-[180px] grid-cols-4 gap-3 max-[900px]:auto-rows-[160px] max-[900px]:grid-cols-2 max-sm:grid-cols-1 max-sm:auto-rows-[140px]">
          {rows.slice(0, 8).map((n, i) => {
            const span = SPANS[i] ?? { col: 1, row: 1 }
            const palette = PALETTES[i % PALETTES.length] ?? PALETTES[0]!
            // E-T07 Batch B2 — DB-driven tagline first, fall back to the
            // legacy TS dictionary when `editorial` is null (the 4 new
            // cities pre-admin-CRUD). Empty string when neither has it.
            const descriptor = QUARTIER_DESCRIPTORS[n.slug]
            const dbLocale = locale === 'mg' ? n.editorial?.mg : n.editorial?.fr
            const tagline =
              dbLocale?.tagline ??
              (descriptor ? t(descriptor.tagline) : '')
            const label = locale === 'mg' ? n.nameMg : n.nameFr
            return (
              <li
                key={n.id}
                style={{ gridColumn: `span ${span.col}`, gridRow: `span ${span.row}` }}
                className="max-sm:!col-span-1 max-sm:!row-span-1"
              >
                <Link
                  // L1 audit fix — scope by city : neighborhood slugs
                  // are unique per-city (composite @@unique). A bare
                  // ?neighborhood=anjoma surfaces results from any
                  // city with an `anjoma` quartier (Fianar + Toamasina).
                  href={`/annonces?city=${n.citySlug}&neighborhood=${n.slug}`}
                  style={{
                    background: `repeating-linear-gradient(135deg, ${palette.bg} 0 14px, color-mix(in oklch, ${palette.bg} 92%, white) 14px 28px)`,
                    color: palette.fg,
                  }}
                  data-feature={span.feature ? 'true' : 'false'}
                  className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl p-[18px] no-underline transition hover:-translate-y-0.5 data-[feature=true]:p-7"
                >
                  <div className="flex items-start justify-between">
                    <span
                      // Palette 3 has white text — use a solid indigo badge
                      // so the count stays readable. Other palettes get the
                      // soft frosted-white pill on dark text.
                      style={
                        palette.fg === '#ffffff'
                          ? { background: 'oklch(0.35 0.18 277)', color: '#ffffff' }
                          : { background: 'rgba(255,255,255,0.85)', color: palette.fg }
                      }
                      className="inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-semibold"
                    >
                      {t(
                        n.publishedListings <= 1
                          ? 'landing.neighborhoods.count.one'
                          : 'landing.neighborhoods.count.other',
                        { count: n.publishedListings },
                      )}
                    </span>
                    <Icon name="arrow-up-right" size={span.feature ? 22 : 16} />
                  </div>
                  <div>
                    <div
                      className={`tracking-[-0.02em] ${span.feature
                        ? 'text-[32px] font-bold leading-none'
                        : 'text-[18px] font-bold leading-[1.1]'
                        }`}
                    >
                      {label}
                    </div>
                    <div
                      className={`mt-1.5 font-medium opacity-80 ${span.feature ? 'text-[14px]' : 'text-[12.5px]'
                        }`}
                    >
                      {tagline}
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
