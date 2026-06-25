import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import { Icon } from '@/components/shared/Icon'

export function LandingFinalCta({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="bg-background pb-20 lg:pb-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="rounded-[28px] bg-[oklch(0.16_0.025_281)] px-8 py-16 text-center text-white sm:px-12 lg:py-20">
          <h2 className="m-0 text-[clamp(32px,3.8vw,52px)] font-normal leading-[1.05] tracking-[-0.025em]">
            {t('landing.finalCta.title')}
          </h2>
          <p className="mx-auto mb-7 mt-3.5 max-w-[560px] text-[16px] leading-[1.55] text-white/80">
            {t('landing.finalCta.lead')}
          </p>
          <Link
            href="/annonces"
            className="inline-flex h-13 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-[oklch(0.16_0.025_281)] hover:text-[oklch(0.16_0.025_281)]/80 transition"
          >
            {t('landing.finalCta.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
