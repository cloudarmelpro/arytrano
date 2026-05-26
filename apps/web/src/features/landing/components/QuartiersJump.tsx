import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { QuartierRow } from '../queries/get-quartiers-data'

export function QuartiersJump({
  locale,
  quartiers,
}: {
  locale: Locale
  quartiers: QuartierRow[]
}) {
  const t = getT(locale)
  return (
    <section className="bg-background pb-12">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-6 lg:flex-row lg:items-baseline lg:gap-8 lg:px-10">
        <span className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground">
          {t('quartiers.jump.eyebrow')}
        </span>
        <nav className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {quartiers.map((q) => {
            const name = locale === 'mg' ? q.nameMg : q.nameFr
            return (
              <a
                key={q.slug}
                href={`#${q.slug}`}
                className="inline-flex items-baseline gap-1.5 text-[14px] font-semibold tracking-[-0.01em] text-foreground/65 transition hover:text-primary"
              >
                <span>{name}</span>
                <span className="font-mono text-[11px] tabular-nums text-foreground/40">
                  {q.publishedListings}
                </span>
              </a>
            )
          })}
        </nav>
      </div>
    </section>
  )
}
