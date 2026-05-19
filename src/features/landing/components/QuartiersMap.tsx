import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { QuartierRow } from '../queries/get-quartiers-data'

const PIN_POSITIONS: Array<{ left: string; top: string }> = [
  { left: '32%', top: '38%' },
  { left: '46%', top: '52%' },
  { left: '56%', top: '46%' },
  { left: '64%', top: '58%' },
  { left: '24%', top: '62%' },
  { left: '40%', top: '70%' },
  { left: '76%', top: '42%' },
  { left: '52%', top: '78%' },
]

export function QuartiersMap({
  locale,
  quartiers,
}: {
  locale: Locale
  quartiers: QuartierRow[]
}) {
  const t = getT(locale)
  return (
    <section className="bg-background pb-8">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-[20px] border border-border bg-[repeating-linear-gradient(135deg,oklch(0.95_0.012_130)_0_16px,oklch(0.97_0.008_130)_16px_32px)] max-[720px]:aspect-[4/3]">
        <span className="pointer-events-none absolute bottom-2.5 right-4 font-mono text-[11px] text-muted-foreground">
          {t('quartiers.map.placeholder')}
        </span>
        {quartiers.slice(0, 8).map((q, i) => {
          const pos = PIN_POSITIONS[i] ?? PIN_POSITIONS[0]
          const name = locale === 'mg' ? q.nameMg : q.nameFr
          return (
            <a
              key={q.slug}
              href={`#${q.slug}`}
              style={{ left: pos.left, top: pos.top }}
              className="absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-background px-3 py-1.5 text-[13px] font-semibold text-foreground shadow-md transition hover:z-10 hover:scale-105 hover:shadow-lg max-[720px]:gap-1.5 max-[720px]:px-2 max-[720px]:py-1 max-[720px]:text-[11.5px]"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              {name}
              <span className="font-mono text-[12px] text-muted-foreground">
                {q.publishedListings}
              </span>
            </a>
          )
        })}
        </div>
      </div>
    </section>
  )
}
