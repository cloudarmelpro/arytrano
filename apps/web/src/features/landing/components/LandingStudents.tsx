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
              className="group relative flex flex-col rounded-2xl border border-border bg-background p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-[0_8px_24px_-12px_rgba(25,25,112,0.22)]"
            >
              {/* Stat block — number anchors the eye, icon balances */}
              <div className="mb-6 flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="font-mono text-[38px] font-bold leading-none tabular-nums tracking-[-0.035em] text-primary">
                    {t(c.stat)}
                  </span>
                  <span className="mt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-foreground/55">
                    {t(c.statSub)}
                  </span>
                </div>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors duration-200 group-hover:bg-primary/15">
                  <Icon name={c.icon} size={20} />
                </span>
              </div>

              <h3 className="m-0 text-[17.5px] font-bold leading-[1.3] tracking-[-0.01em] text-foreground">
                {t(c.title)}
              </h3>
              <p className="mb-4 mt-2 flex-1 text-[13.5px] leading-[1.55] text-foreground/65">
                {t(c.desc)}
              </p>

              {/* Highlight strip — separator + check + brand-tone text */}
              <div className="flex items-center gap-2 border-t border-border/70 pt-3.5 text-[12px] font-semibold text-foreground">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Icon name="check" size={11} />
                </span>
                <span className="line-clamp-2 text-foreground/75">
                  {t(c.highlight)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
