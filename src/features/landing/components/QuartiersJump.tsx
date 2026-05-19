import type { Locale } from '@/lib/i18n/config'
import type { QuartierRow } from '../queries/get-quartiers-data'

export function QuartiersJump({
  locale,
  quartiers,
}: {
  locale: Locale
  quartiers: QuartierRow[]
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <div className="flex flex-wrap gap-2">
        {quartiers.map((q) => {
          const name = locale === 'mg' ? q.nameMg : q.nameFr
          return (
            <a
              key={q.slug}
              href={`#${q.slug}`}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3.5 text-[13.5px] font-semibold text-foreground transition hover:border-primary hover:bg-primary/5"
            >
              {name}
              <span className="font-mono text-[12px] text-muted-foreground">
                {q.publishedListings}
              </span>
            </a>
          )
        })}
      </div>
    </section>
  )
}
