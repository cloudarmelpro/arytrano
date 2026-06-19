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
    <section className="bg-white py-20 lg:py-24">
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

        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => (
            <li
              key={c.title}
              className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(16,18,40,0.04),0_8px_28px_-16px_rgba(16,18,40,0.12)] ring-1 ring-border/60 transition-all duration-300 hover:shadow-[0_2px_4px_rgba(16,18,40,0.05),0_18px_40px_-18px_rgba(25,25,112,0.28)] hover:ring-primary/30"
            >
              {/* Icon chip : passe en plein sur hover (moment de
                  personnalité). Pas de scale → pas de layout shift. */}
              <span className="mb-7 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/15 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary">
                <Icon name={c.icon} size={22} />
              </span>

              {/* Stat metric — gros chiffre mono qui ancre l'œil.
                  Souligné par une fine barre primary qui s'élargit
                  sur hover (cue d'interactivité sans déplacement). */}
              <div>
                <span className="font-mono text-[34px] font-bold leading-none tabular-nums tracking-[-0.03em] text-foreground">
                  {t(c.stat)}
                </span>
                <span className="mt-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/55">
                  {t(c.statSub)}
                </span>
                <span
                  aria-hidden
                  className="mt-3 block h-px w-8 bg-primary/40 transition-all duration-300 group-hover:w-16 group-hover:bg-primary"
                />
              </div>

              {/* Titre + description — lecture principale */}
              <h3 className="mt-5 text-[17.5px] font-bold leading-[1.3] tracking-[-0.012em] text-foreground">
                {t(c.title)}
              </h3>
              <p className="mt-2 mb-5 flex-1 text-[13.5px] leading-[1.6] text-foreground/65">
                {t(c.desc)}
              </p>

              {/* Highlight comme un footer minimal — check + texte
                  aligné, sans bordure top (le rythme est porté par
                  l'espace, pas par une ligne). */}
              <div className="flex items-center gap-2 text-[12.5px] font-semibold">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <Icon name="check" size={12} />
                </span>
                <span className="text-foreground/80">{t(c.highlight)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
