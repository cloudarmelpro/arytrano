import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import { Icon, type IconName } from '@/components/shared/Icon'

const CARDS: Array<{
  icon: IconName
  stat: MessageKey
  statSub: MessageKey
  title: MessageKey
  desc: MessageKey
  highlight: MessageKey
}> = [
  {
    icon: 'wifi',
    stat: 'landing.students.s1.stat',
    statSub: 'landing.students.s1.statSub',
    title: 'landing.students.s1.title',
    desc: 'landing.students.s1.desc',
    highlight: 'landing.students.s1.highlight',
  },
  {
    icon: 'check',
    stat: 'landing.students.s2.stat',
    statSub: 'landing.students.s2.statSub',
    title: 'landing.students.s2.title',
    desc: 'landing.students.s2.desc',
    highlight: 'landing.students.s2.highlight',
  },
  {
    icon: 'whatsapp',
    stat: 'landing.students.s3.stat',
    statSub: 'landing.students.s3.statSub',
    title: 'landing.students.s3.title',
    desc: 'landing.students.s3.desc',
    highlight: 'landing.students.s3.highlight',
  },
  {
    icon: 'globe',
    stat: 'landing.students.s4.stat',
    statSub: 'landing.students.s4.statSub',
    title: 'landing.students.s4.title',
    desc: 'landing.students.s4.desc',
    highlight: 'landing.students.s4.highlight',
  },
]

/**
 * "Pour les étudiants" — 4 stat-led feature cards in a 4-up grid.
 *
 * Design refresh 2026-06-15 (ui-ux-pro-max): switched from dark
 * oklch palette to white surface with subtle muted band background
 * so the section reads as a feature highlight without breaking the
 * white-flow of the page. Stat numbers use the brand indigo
 * (tabular-nums tracking-tight) for a financial / metric feel.
 * Cards rely on border + shadow lift on hover (no transform
 * displacement → no layout shift, per ui-ux-pro-max guideline).
 */
export function LandingStudents({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="bg-muted/30 py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* Header — same rhythm as the other landing sections */}
        <header className="mb-12 grid items-end gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
              {t('landing.students.eyebrow')}
            </span>
            <h2 className="mt-3.5 text-[clamp(32px,3.6vw,48px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
              {t('landing.students.title')}
            </h2>
          </div>
          <p className="max-w-[440px] text-[15.5px] leading-[1.55] text-foreground/65">
            {t('landing.students.lead')}
          </p>
        </header>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => (
            <li
              key={c.title}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background p-6 pl-7 transition-all duration-200 hover:border-primary/40 hover:shadow-[0_10px_28px_-14px_rgba(25,25,112,0.25)]"
            >
              {/* Vertical primary accent — editorial signal, gives the
                  card a clear "feature highlight" identity without
                  needing a heavy colored background. */}
              <span
                aria-hidden
                className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full bg-primary/70 transition-all duration-200 group-hover:bg-primary group-hover:top-4 group-hover:bottom-4"
              />

              {/* Top row : icon chip (left) + highlight feature pill (right) */}
              <div className="mb-5 flex items-start justify-between gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15 transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary">
                  <Icon name={c.icon} size={20} />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-emerald-700 ring-1 ring-emerald-200">
                  <Icon name="check" size={10} />
                  <span className="line-clamp-1">{t(c.highlight)}</span>
                </span>
              </div>

              {/* Stat as eyebrow metric : compact 28px instead of 38px so
                  the title becomes the primary reading anchor. */}
              <div className="mb-3 flex items-baseline gap-1.5">
                <span className="font-mono text-[28px] font-bold leading-none tabular-nums tracking-[-0.025em] text-foreground">
                  {t(c.stat)}
                </span>
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-foreground/55">
                  {t(c.statSub)}
                </span>
              </div>

              <h3 className="text-[18px] font-bold leading-[1.3] tracking-[-0.015em] text-foreground">
                {t(c.title)}
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-foreground/65">
                {t(c.desc)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
