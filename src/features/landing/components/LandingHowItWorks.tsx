import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'

const STEPS: Array<{
  n: string
  title: MessageKey
  body: MessageKey
}> = [
  { n: '01', title: 'landing.how.step1.title', body: 'landing.how.step1.body' },
  { n: '02', title: 'landing.how.step2.title', body: 'landing.how.step2.body' },
  { n: '03', title: 'landing.how.step3.title', body: 'landing.how.step3.body' },
]

export function LandingHowItWorks({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="bg-[oklch(0.16_0.025_281)] px-6 py-20 text-white lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-[1280px] items-start gap-16 lg:grid-cols-[1fr_2fr] max-lg:gap-10">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[oklch(0.85_0.06_277)]">
            {t('landing.how.eyebrow' as MessageKey)}
          </span>
          <h2 className="mt-3.5 mb-4 font-serif text-[clamp(32px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.025em]">
            {t('landing.how.title')}
          </h2>
          <p className="max-w-[360px] text-[15.5px] leading-[1.55] text-[oklch(0.78_0.015_277)]">
            {t('landing.how.lead')}
          </p>
        </div>
        <ol className="flex flex-col">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="grid grid-cols-[64px_1fr] gap-6 border-t border-[oklch(0.28_0.02_277)] py-6 first:border-t-0 first:pt-0 max-sm:grid-cols-[44px_1fr] max-sm:gap-4"
            >
              <div className="pt-1 font-mono text-[14px] font-semibold tracking-[0.04em] text-[oklch(0.85_0.06_277)]">
                {s.n}
              </div>
              <div>
                <h3 className="text-[22px] font-bold tracking-[-0.015em] text-white">
                  {t(s.title)}
                </h3>
                <p className="mt-1.5 max-w-[540px] text-[14.5px] leading-[1.55] text-[oklch(0.78_0.015_277)]">
                  {t(s.body)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
