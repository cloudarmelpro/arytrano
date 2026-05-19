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

export function LandingStudents({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="bg-[oklch(0.18_0.02_277)] py-20 text-white lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="mb-10 grid items-end gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[oklch(0.85_0.06_277)]">
              {t('landing.students.eyebrow')}
            </span>
            <h2 className="mt-3.5 font-serif text-[clamp(32px,3.6vw,48px)] font-normal leading-[1.05] tracking-[-0.025em]">
              {t('landing.students.title')}
            </h2>
          </div>
          <p className="max-w-[440px] text-[15.5px] leading-[1.55] text-[oklch(0.78_0.015_277)]">
            {t('landing.students.lead')}
          </p>
        </header>

        <ul className="grid gap-3.5 lg:grid-cols-4 md:grid-cols-2">
          {CARDS.map((c) => (
            <li
              key={c.title}
              className="flex flex-col rounded-2xl border border-[oklch(0.28_0.02_277)] bg-[oklch(0.22_0.02_277)] p-5 transition hover:-translate-y-1 hover:border-primary hover:bg-[oklch(0.24_0.02_277)]"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="bg-gradient-to-b from-white to-[oklch(0.85_0.12_277)] bg-clip-text text-[38px] font-bold leading-none tracking-[-0.04em] text-transparent">
                    {t(c.stat)}
                  </span>
                  <span className="mt-1 text-[11.5px] font-medium uppercase tracking-[0.06em] text-[oklch(0.65_0.02_277)]">
                    {t(c.statSub)}
                  </span>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[oklch(0.34_0.08_277)] bg-[oklch(0.28_0.10_277)] text-[oklch(0.85_0.06_277)]">
                  <Icon name={c.icon} size={22} />
                </span>
              </div>
              <h3 className="m-0 text-[18px] font-bold leading-[1.3] tracking-[-0.015em] text-white">
                {t(c.title)}
              </h3>
              <p className="mb-4 mt-2 flex-1 text-[13.5px] font-medium leading-[1.55] text-[oklch(0.72_0.015_277)]">
                {t(c.desc)}
              </p>
              <div className="inline-flex items-center gap-1.5 border-t border-[oklch(0.28_0.02_277)] pt-3.5 text-[12px] font-semibold text-[oklch(0.85_0.06_277)]">
                <Icon name="check" size={13} /> {t(c.highlight)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
