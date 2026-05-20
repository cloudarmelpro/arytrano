import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import { Icon } from '@/components/shared/Icon'

const STATS: Array<{ n: MessageKey; label: MessageKey; color: string }> = [
  // OKLCH ~0.55 luminance keeps the numbers legible on the white
  // section bg while staying within AryTrano's warm/cool brand range.
  { n: 'comment.why.stat1.n', label: 'comment.why.stat1.label', color: 'oklch(0.55 0.16 277)' },
  { n: 'comment.why.stat2.n', label: 'comment.why.stat2.label', color: 'oklch(0.55 0.15 152)' },
  { n: 'comment.why.stat3.n', label: 'comment.why.stat3.label', color: 'oklch(0.6 0.16 60)' },
  { n: 'comment.why.stat4.n', label: 'comment.why.stat4.label', color: 'oklch(0.55 0.18 25)' },
]

const VERIF: Array<{
  title: MessageKey
  desc: MessageKey
  why: MessageKey
}> = [
  { title: 'comment.verif.v1.title', desc: 'comment.verif.v1.desc', why: 'comment.verif.v1.why' },
  { title: 'comment.verif.v2.title', desc: 'comment.verif.v2.desc', why: 'comment.verif.v2.why' },
  { title: 'comment.verif.v3.title', desc: 'comment.verif.v3.desc', why: 'comment.verif.v3.why' },
  { title: 'comment.verif.v4.title', desc: 'comment.verif.v4.desc', why: 'comment.verif.v4.why' },
  { title: 'comment.verif.v5.title', desc: 'comment.verif.v5.desc', why: 'comment.verif.v5.why' },
  { title: 'comment.verif.v6.title', desc: 'comment.verif.v6.desc', why: 'comment.verif.v6.why' },
]

const DONTS: MessageKey[] = [
  'comment.dont.i1',
  'comment.dont.i2',
  'comment.dont.i3',
  'comment.dont.i4',
  'comment.dont.i5',
  'comment.dont.i6',
]

export function CommentWhy({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1280px] items-center gap-16 px-6 lg:grid-cols-[1fr_1.4fr] lg:px-10 max-lg:gap-10">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('comment.why.eyebrow')}
          </span>
          <h2 className="mt-3.5 mb-4 font-serif text-[clamp(32px,3.6vw,44px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
            {t('comment.why.title')}
          </h2>
          <p className="max-w-[460px] text-[15.5px] leading-[1.6] text-foreground/70">
            {t('comment.why.p1')}
          </p>
          <p className="mt-3.5 max-w-[460px] text-[15.5px] leading-[1.6] text-foreground/70">
            {t('comment.why.p2')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-muted/40 p-5"
            >
              <div
                style={{ color: s.color }}
                className="font-mono text-[36px] font-bold leading-none tracking-[-0.03em]"
              >
                {t(s.n)}
              </div>
              <div className="mt-2 text-[13.5px] font-medium leading-[1.45] text-muted-foreground">
                {t(s.label)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CommentVerif({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section id="verification" className="bg-background py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1280px] items-start gap-16 px-6 lg:grid-cols-[1fr_2fr] lg:px-10 max-lg:gap-10">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('comment.verif.eyebrow')}
          </span>
          <h2 className="mt-3.5 mb-4 font-serif text-[clamp(32px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
            {t('comment.verif.title')}
          </h2>
        </div>
        <ol className="flex flex-col">
          {VERIF.map((v, i) => {
            const idx = String(i + 1).padStart(2, '0')
            return (
              <li
                key={v.title}
                className="grid grid-cols-[64px_1fr] gap-6 border-t border-border py-6 first:border-t-0 first:pt-0 max-sm:grid-cols-[44px_1fr] max-sm:gap-4"
              >
                <div className="pt-1 font-mono text-[14px] font-semibold tracking-[0.04em] text-primary">
                  {idx}
                </div>
                <div>
                  <h3 className="text-[22px] font-bold tracking-[-0.015em] text-foreground">
                    {t(v.title)}
                  </h3>
                  <p className="mt-1.5 max-w-[540px] text-[14.5px] leading-[1.55] text-foreground/70">
                    {t(v.desc)}
                  </p>
                  <p className="mt-2.5 max-w-[540px] text-[13px] font-medium text-primary">
                    <span aria-hidden className="mr-1.5">→</span>
                    {t(v.why)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export function CommentDont({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1280px] items-start gap-14 px-6 lg:grid-cols-[1fr_1.4fr] lg:px-10 max-lg:gap-10">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('comment.dont.eyebrow')}
          </span>
          <h2 className="mt-3.5 font-serif text-[clamp(32px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('comment.dont.title')}
          </h2>
          <p className="mt-3.5 max-w-[380px] text-[15.5px] leading-[1.6] text-foreground/70">
            {t('comment.dont.sub')}
          </p>
        </div>
        <ul className="grid gap-2.5 max-sm:grid-cols-1 sm:grid-cols-2">
          {DONTS.map((k) => (
            <li
              key={k}
              className="flex items-start gap-3 rounded-xl bg-muted/40 px-4 py-3 text-[14.5px] leading-[1.55] text-foreground"
            >
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
              >
                <span className="h-0.5 w-2 rounded bg-current" />
              </span>
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function CommentFinalCta({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="bg-background pb-16 lg:pb-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="rounded-[28px] bg-[oklch(0.16_0.025_281)] px-8 py-14 text-center text-white sm:px-12 lg:py-16">
          <h2 className="m-0 font-serif text-[clamp(28px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.025em]">
            {t('comment.finalCta.student.title')}
          </h2>
          <p className="mx-auto mb-7 mt-3 max-w-[560px] text-[15.5px] leading-[1.55] text-white/80">
            {t('comment.finalCta.student.lead')}
          </p>
          <Link
            href="/annonces"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-[oklch(0.16_0.025_281)] transition hover:bg-white/90"
          >
            {t('comment.finalCta.student.cta')} <Icon name="arrow-right" size={16} />
          </Link>
          <div className="mt-6 text-[13.5px] text-white/70">
            <Link
              href="/proprietaires"
              className="font-semibold text-white underline-offset-4 transition hover:underline"
            >
              {t('comment.finalCta.owner.cta')} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

