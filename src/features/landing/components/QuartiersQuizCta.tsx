import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

export function QuartiersQuizCta({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="border-y border-border bg-muted/40 py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mx-auto max-w-[800px] text-center">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          {t('quartiers.cta.eyebrow')}
        </span>
        <h2 className="mx-auto mt-3 font-serif text-[clamp(28px,3.2vw,40px)] font-normal leading-[1.1] tracking-[-0.018em] text-foreground">
          {t('quartiers.cta.title')}
        </h2>
        <p className="mx-auto mt-3.5 max-w-[600px] text-[16px] leading-[1.55] text-foreground/70">
          {t('quartiers.cta.lead')}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {/*
            T-052 quartier quiz route is not yet built — link target intentionally
            points back to listings as a soft fallback. Swap to /quartiers/quiz
            once the wizard ships.
          */}
          <Link
            href="/annonces"
            className="inline-flex h-13 items-center rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            {t('quartiers.cta.primary')} <span aria-hidden className="ml-2">→</span>
          </Link>
          <Link
            href="/annonces"
            className="inline-flex h-13 items-center rounded-xl border border-border bg-background px-6 text-[15px] font-semibold text-foreground transition hover:bg-muted"
          >
            {t('quartiers.cta.secondary')}
          </Link>
        </div>
        </div>
      </div>
    </section>
  )
}
