import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'

const ITEMS: ReadonlyArray<{
  title: MessageKey
  subtitle: MessageKey
}> = [
  {
    title: 'landing.trust.verified.title',
    subtitle: 'landing.trust.verified.subtitle',
  },
  {
    title: 'landing.trust.photos.title',
    subtitle: 'landing.trust.photos.subtitle',
  },
  {
    title: 'landing.trust.contact.title',
    subtitle: 'landing.trust.contact.subtitle',
  },
  {
    title: 'landing.trust.price.title',
    subtitle: 'landing.trust.price.subtitle',
  },
]

export function LandingTrustStrip({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10">
        <header className="mb-12 grid items-end gap-8 lg:mb-16 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
              {t('landing.trust.eyebrow')}
            </span>
            <h2 className="mt-3.5 font-serif text-[clamp(28px,3.4vw,40px)] font-normal leading-[1.05] tracking-[-0.018em] text-foreground">
              {t('landing.trust.heading')}
            </h2>
          </div>
          <p className="max-w-[540px] text-[15.5px] leading-[1.55] text-foreground/65">
            {t('landing.trust.lead')}
          </p>
        </header>

        <ul className="grid grid-cols-1 lg:grid-cols-4">
          {ITEMS.map((it, idx) => {
            const n = (idx + 1).toString().padStart(2, '0')
            return (
              <li
                key={it.title}
                className="flex flex-col gap-5 border-t border-border py-8 first:border-t-0 first:pt-0 lg:border-t-0 lg:border-l lg:px-7 lg:py-2 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              >
                <span className="font-serif text-[clamp(48px,5vw,68px)] font-light leading-none tracking-[-0.025em] text-primary">
                  {n}
                </span>
                <div className="flex flex-col gap-3">
                  <h3 className="text-[17px] font-bold leading-[1.2] tracking-[-0.015em] text-foreground">
                    {t(it.title)}
                  </h3>
                  <span aria-hidden className="block h-px w-8 bg-primary/40" />
                  <p className="text-[14px] leading-[1.55] text-foreground/65">
                    {t(it.subtitle)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
