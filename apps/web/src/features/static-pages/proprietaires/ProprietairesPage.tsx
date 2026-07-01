import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT, type Translator } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import { Icon } from '@/components/shared/Icon'
import { ProprietairesFaqAccordion } from './ProprietairesFaqAccordion'
import { PROPRIETAIRES_FAQ_ITEMS } from './faq-items'

const STEPS: Array<{ n: string; title: MessageKey; desc: MessageKey }> = [
  { n: '01', title: 'proprietaires.steps.s1.title', desc: 'proprietaires.steps.s1.desc' },
  { n: '02', title: 'proprietaires.steps.s2.title', desc: 'proprietaires.steps.s2.desc' },
  { n: '03', title: 'proprietaires.steps.s3.title', desc: 'proprietaires.steps.s3.desc' },
  { n: '04', title: 'proprietaires.steps.s4.title', desc: 'proprietaires.steps.s4.desc' },
]

const VERIF_ITEMS: Array<{ title: MessageKey; desc: MessageKey }> = [
  { title: 'proprietaires.verif.i1.title', desc: 'proprietaires.verif.i1.desc' },
  { title: 'proprietaires.verif.i2.title', desc: 'proprietaires.verif.i2.desc' },
  { title: 'proprietaires.verif.i3.title', desc: 'proprietaires.verif.i3.desc' },
  { title: 'proprietaires.verif.i4.title', desc: 'proprietaires.verif.i4.desc' },
]

const PUBLICATION_F: MessageKey[] = [
  'proprietaires.pricing.publication.f1',
  'proprietaires.pricing.publication.f2',
  'proprietaires.pricing.publication.f3',
  'proprietaires.pricing.publication.f4',
  'proprietaires.pricing.publication.f5',
]

const SUCCESS_F: MessageKey[] = [
  'proprietaires.pricing.success.f1',
  'proprietaires.pricing.success.f2',
  'proprietaires.pricing.success.f3',
  'proprietaires.pricing.success.f4',
  'proprietaires.pricing.success.f5',
]

const FLOW_STEPS: MessageKey[] = [
  'proprietaires.pricing.flow.step1',
  'proprietaires.pricing.flow.step2',
  'proprietaires.pricing.flow.step3',
  'proprietaires.pricing.flow.step4',
]

const HERO_STATS: ReadonlyArray<{ n: MessageKey; l: MessageKey }> = [
  { n: 'proprietaires.hero.stat1.n', l: 'proprietaires.hero.stat1.label' },
  { n: 'proprietaires.hero.stat2.n', l: 'proprietaires.hero.stat2.label' },
  { n: 'proprietaires.hero.stat3.n', l: 'proprietaires.hero.stat3.label' },
]


export function ProprietairesPage({
  locale,
  activeOwners,
}: {
  locale: Locale
  /** Live count of verified-active owners (cached 5min via getLandingStats). */
  activeOwners: number
}) {
  const t = getT(locale)
  return (
    <>
      <Hero t={t} activeOwners={activeOwners} />
      <PublishSteps t={t} />
      <Verification t={t} />
      <Pricing t={t} />
      <Faq t={t} />
      <FinalCta t={t} />
    </>
  )
}

function Hero({
  t,
  activeOwners,
}: {
  t: Translator
  activeOwners: number
}) {
  return (
    <section className="relative isolate overflow-hidden bg-background py-20 lg:py-28">
      {/* Background — subtle primary tinted gradient + decorative topographic SVG */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(ellipse 90% 60% at 100% 0%, oklch(0.92 0.06 277 / 0.45), transparent 60%)',
            'radial-gradient(ellipse 60% 40% at 0% 100%, oklch(0.96 0.025 277 / 0.5), transparent 55%)',
          ].join(', '),
        }}
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -right-20 -z-10 h-[420px] w-[640px] opacity-30 max-lg:hidden"
        viewBox="0 0 640 420"
        fill="none"
      >
        {/* Topographic-feel contour lines suggesting Madagascar terrain */}
        <path d="M-20 220 Q120 180 220 200 T420 180 T640 160" stroke="oklch(0.55 0.12 277)" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeDasharray="3 4" />
        <path d="M-20 280 Q140 240 240 260 T440 240 T640 230" stroke="oklch(0.55 0.12 277)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M-20 340 Q160 300 260 320 T460 300 T640 290" stroke="oklch(0.55 0.12 277)" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeDasharray="1 5" />
        <path d="M-20 400 Q180 360 280 380 T480 360 T640 350" stroke="oklch(0.55 0.12 277)" strokeWidth="0.6" fill="none" strokeLinecap="round" />
      </svg>

      <div className="relative mx-auto grid max-w-[1280px] items-start gap-14 px-6 lg:grid-cols-[1.18fr_1fr] lg:gap-16 lg:px-10 max-lg:gap-12">
        <div>
          {/* Trust pills above eyebrow — small signals, magazine-style.
              The first pill is a LIVE counter of verified-active owners
              (cached server-side 5 min via getLandingStats). The pulsing
              dot signals "live" without lying about real-time. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11.5px] font-medium text-foreground/55">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="relative inline-flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {activeOwners}
              </span>
              <span>
                {t(
                  activeOwners <= 1
                    ? 'proprietaires.hero.trustpill.activeOwners.one'
                    : 'proprietaires.hero.trustpill.activeOwners.other',
                )}
              </span>
            </span>
            <span aria-hidden className="text-foreground/25">·</span>
            <span>{t('proprietaires.hero.trustpill1')}</span>
            <span aria-hidden className="text-foreground/25">·</span>
            <span>{t('proprietaires.hero.trustpill2')}</span>
          </div>

          <span aria-hidden className="mt-6 block h-px w-12 bg-primary" />
          <span className="mt-5 inline-block text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('proprietaires.hero.eyebrow')}
          </span>
          <h1 className="mt-3.5 text-[clamp(36px,4.4vw,64px)] font-normal leading-[1.05] tracking-[-0.025em] text-balance text-foreground">
            {t('proprietaires.hero.title')}
          </h1>
          <p className="mt-6 max-w-[580px] text-[17px] leading-[1.6] text-foreground/65 sm:text-[18.5px]">
            {t('proprietaires.hero.sub')}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="#publier"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {t('proprietaires.hero.ctaPrimary')} <Icon name="arrow-right" size={16} />
              </Link>
              <Link
                href="#tarifs"
                className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-foreground underline-offset-4 transition hover:text-primary hover:underline"
              >
                {t('proprietaires.hero.ctaSecondary')}
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>
            <p className="text-[12.5px] font-medium text-foreground/55">
              {t('proprietaires.hero.ctaMicrocopy')}
            </p>
          </div>
          <dl className="mt-14 grid grid-cols-1 border-t border-border sm:grid-cols-3">
            {HERO_STATS.map((s, i) => (
              <div
                key={s.l}
                className={`flex flex-col py-6 sm:py-7 ${
                  i > 0
                    ? 'border-t border-border sm:border-t-0 sm:border-l sm:pl-6 lg:pl-8'
                    : ''
                }`}
              >
                <dd className="text-[clamp(40px,4.4vw,60px)] font-light leading-none tracking-[-0.035em] text-primary tabular-nums">
                  {t(s.n)}
                </dd>
                <dt className="mt-3 text-[11px] font-semibold uppercase leading-[1.4] tracking-[0.14em] text-foreground/55">
                  {t(s.l)}
                </dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative">
          {/* Floating "new message" notification — depth + alive vibe */}
          <div
            aria-hidden
            className="absolute -top-4 -right-2 z-10 inline-flex items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)] max-sm:hidden"
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="message" size={13} />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[11.5px] font-bold text-foreground">
                {t('proprietaires.hero.notif.title')}
              </span>
              <span className="text-[10.5px] font-medium text-foreground/55">
                {t('proprietaires.hero.notif.body')}
              </span>
            </div>
          </div>
          <PublishPreview t={t} />
        </div>
      </div>
    </section>
  )
}

function PublishPreview({ t }: { t: Translator }) {
  return (
    <div
      // Decorative "live annonce" mock — looks like a published listing
      // summary, not a wizard form. `aria-hidden` + `inert` keep SR +
      // keyboard users from landing on dead controls.
      aria-hidden
      inert
      className="overflow-hidden rounded-2xl border border-border bg-background select-none shadow-[0_8px_24px_-16px_rgba(25,25,112,0.18)]"
    >
      {/* Header — verified badge + live status */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Icon name="shield" size={13} />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[12px] font-bold text-foreground">
              {t('proprietaires.preview.verified')}
            </span>
            <span className="text-[10.5px] font-medium text-foreground/55">
              {t('proprietaires.preview.live')}
            </span>
          </div>
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-foreground/45">
          {t('proprietaires.preview.url')}
        </span>
      </div>

      {/* Listing title + location */}
      <div className="px-5 pt-5 sm:px-6">
        <h3 className="text-[clamp(20px,2.2vw,26px)] font-normal leading-[1.15] tracking-[-0.02em] text-foreground">
          {t('proprietaires.preview.field.typeV')}
        </h3>
        <p className="mt-1.5 text-[12.5px] font-medium text-foreground/65">
          {t('proprietaires.preview.subtitle')}
        </p>
      </div>

      {/* 2x2 grid of listing facts — hairline divides, no boxed sub-cards */}
      <dl className="mx-5 mt-5 grid grid-cols-2 divide-x divide-y divide-border border-y border-border sm:mx-6">
        {(
          [
            ['proprietaires.preview.field.type', 'proprietaires.preview.field.typeV'],
            ['proprietaires.preview.field.quartier', 'proprietaires.preview.field.quartierV'],
            ['proprietaires.preview.field.surface', 'proprietaires.preview.field.surfaceV'],
            ['proprietaires.preview.field.price', 'proprietaires.preview.field.priceV'],
          ] satisfies Array<readonly [MessageKey, MessageKey]>
        ).map(([labelKey, valueKey]) => (
          <div key={labelKey} className="px-3 py-3">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
              {t(labelKey)}
            </dt>
            <dd className="mt-1 text-[13.5px] font-semibold text-foreground tabular-nums">
              {t(valueKey)}
            </dd>
          </div>
        ))}
      </dl>

      {/* Photos grid */}
      <div className="px-5 pt-5 sm:px-6">
        <div className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
          {t('proprietaires.preview.photos')}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-[repeating-linear-gradient(135deg,oklch(0.92_0.025_70)_0_8px,oklch(0.95_0.018_70)_8px_16px)]"
            />
          ))}
          <div className="flex aspect-square items-center justify-center rounded-lg bg-muted/50 text-foreground/45">
            <Icon name="plus" size={20} />
          </div>
        </div>
      </div>

      {/* Live stats footer — gives "annonce que tourne" feel */}
      <div className="mt-5 flex items-center gap-3 border-t border-border bg-muted/30 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] tabular-nums text-foreground/65 sm:px-6">
        <span>{t('proprietaires.preview.stats.views')}</span>
        <span aria-hidden className="text-foreground/25">
          ·
        </span>
        <span>{t('proprietaires.preview.stats.contacts')}</span>
        <span aria-hidden className="text-foreground/25">
          ·
        </span>
        <span>{t('proprietaires.preview.stats.posted')}</span>
      </div>
    </div>
  )
}

function PublishSteps({ t }: { t: Translator }) {
  return (
    <section id="publier" className="bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="mb-10 text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('proprietaires.steps.eyebrow')}
          </span>
          <h2 className="mt-3 text-[clamp(32px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('proprietaires.steps.title')}
          </h2>
        </header>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="flex flex-col rounded-2xl bg-muted/40 p-6"
            >
              <div className="font-mono text-[12px] font-semibold tracking-[0.08em] text-primary">
                {s.n}
              </div>
              <div className="mt-3.5 text-[17px] font-bold tracking-[-0.01em] text-foreground">
                {t(s.title)}
              </div>
              <div className="mt-1.5 text-[14px] leading-[1.55] text-foreground/70">
                {t(s.desc)}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Verification({ t }: { t: Translator }) {
  return (
    <section id="verif" className="bg-background py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1280px] items-start gap-12 px-6 lg:grid-cols-[1.1fr_1fr] lg:px-10 max-lg:gap-10">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('proprietaires.verif.eyebrow')}
          </span>
          <h2 className="mt-3.5 text-[clamp(32px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('proprietaires.verif.title')}
          </h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-foreground/70">
            {t('proprietaires.verif.body')}
          </p>
          <ul className="mt-6 flex flex-col gap-4">
            {VERIF_ITEMS.map((it) => (
              <li key={it.title} className="flex items-start gap-3.5">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon name="check" size={14} />
                </span>
                <div>
                  <div className="text-[15px] font-semibold text-foreground">
                    {t(it.title)}
                  </div>
                  <div className="mt-0.5 text-[13.5px] leading-[1.55] text-muted-foreground">
                    {t(it.desc)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <VerifCard t={t} />
      </div>
    </section>
  )
}

function VerifCard({ t }: { t: Translator }) {
  return (
    // Decorative panel — illustrates what AryTrano actually verifies.
    // `aria-hidden inert` keeps SR + keyboard tour out, "APERÇU"
    // badge prevents visitors from reading it as a real profile.
    <div aria-hidden inert className="relative select-none">
      <span className="absolute -top-3 left-4 inline-flex h-6 items-center rounded-full bg-foreground px-2.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-background">
        {t('proprietaires.verif.card.preview')}
      </span>
      <div className="rounded-2xl bg-muted/40 p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-bold text-foreground">
              {t('proprietaires.verif.card.author')}
            </div>
            <div className="text-[12.5px] font-medium text-muted-foreground">
              {t('proprietaires.verif.card.verifiedAt')}
            </div>
          </div>
          <span className="inline-flex h-6 items-center gap-1 rounded-full bg-emerald-50 px-2.5 text-[11.5px] font-semibold text-emerald-700">
            <Icon name="shield" size={11} /> {t('proprietaires.verif.card.badge')}
          </span>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-[18px] gap-y-2.5 text-[13.5px]">
          {(
            [
              ['proprietaires.verif.card.row.cin', 'proprietaires.verif.card.row.cinV'],
              ['proprietaires.verif.card.row.acte', 'proprietaires.verif.card.row.acteV'],
              ['proprietaires.verif.card.row.phone', 'proprietaires.verif.card.row.phoneV'],
              ['proprietaires.verif.card.row.active', 'proprietaires.verif.card.row.activeV'],
              ['proprietaires.verif.card.row.response', 'proprietaires.verif.card.row.responseV'],
              ['proprietaires.verif.card.row.rating', 'proprietaires.verif.card.row.ratingV'],
            ] satisfies Array<readonly [MessageKey, MessageKey]>
          ).map(([k, v]) => (
            <div key={k} className="contents">
              <span className="font-medium text-muted-foreground">{t(k)}</span>
              <span className="font-semibold text-foreground">{t(v)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Pricing({ t }: { t: Translator }) {
  return (
    <section id="tarifs" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-[1080px] px-6 lg:px-10">
        {/* Section header — editorial */}
        <header className="mb-16 text-center lg:mb-20">
          <span aria-hidden className="mx-auto block h-px w-12 bg-primary" />
          <span className="mt-5 inline-block text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('proprietaires.pricing.eyebrow')}
          </span>
          <h2 className="mt-3 text-[clamp(40px,4.4vw,60px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
            {t('proprietaires.pricing.title')}
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[16px] leading-[1.6] text-foreground/65">
            {t('proprietaires.pricing.lead')}
          </p>
        </header>

        {/* Editorial pricing stack — 2 rangées hairline, pas de cards */}
        <div className="border-foreground/15">
          {/* Row 1 — Publication (free) : typographie plus discrète */}
          <article className="grid gap-10 border-b border-foreground/15 py-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16 lg:py-16">
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground/55">
                {t('proprietaires.pricing.publication.eyebrow')}
              </span>
              <div className="mt-5 text-[clamp(56px,6vw,80px)] font-normal leading-none tracking-[-0.035em] text-foreground">
                {t('proprietaires.pricing.publication.price')}
              </div>
              <p className="mt-4 text-[14px] leading-[1.55] text-foreground/65">
                {t('proprietaires.pricing.publication.sub')}
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.2] tracking-[-0.02em] text-foreground">
                {t('proprietaires.pricing.publication.h3')}
              </h3>
              <ul className="mt-6 divide-y divide-border">
                {PUBLICATION_F.map((f) => (
                  <li
                    key={f}
                    className="flex items-baseline gap-3 py-3"
                  >
                    <span
                      aria-hidden
                      className="select-none text-[18px] font-bold leading-none text-primary/55"
                    >
                      ·
                    </span>
                    <span className="text-[14.5px] leading-[1.55] text-foreground">
                      {t(f)}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up?role=OWNER"
                className="mt-7 inline-flex items-center gap-1.5 self-start text-[14px] font-semibold text-foreground underline-offset-4 transition hover:text-primary hover:underline"
              >
                {t('proprietaires.pricing.publication.cta')}
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          </article>

          {/* Row 2 — Quand tu loues : typographie dominante + primary */}
          <article className="grid gap-10 py-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16 lg:py-16">
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
                {t('proprietaires.pricing.success.eyebrow')}
              </span>
              <div className="mt-5 text-[clamp(64px,7vw,96px)] font-normal leading-none tracking-[-0.04em] text-primary">
                {t('proprietaires.pricing.success.price')}
              </div>
              <p className="mt-3 text-[18px] font-semibold leading-tight text-primary sm:text-[20px]">
                {t('proprietaires.pricing.success.priceSuffix')}
              </p>
              <p className="mt-5 text-[14px] leading-[1.55] text-foreground/65">
                {t('proprietaires.pricing.success.sub')}
              </p>
              <p className="mt-5 font-mono text-[12.5px] leading-[1.5] tabular-nums text-foreground/55">
                {t('proprietaires.pricing.success.example')}
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.2] tracking-[-0.02em] text-foreground">
                {t('proprietaires.pricing.success.h3')}
              </h3>
              <ul className="mt-6 divide-y divide-border">
                {SUCCESS_F.map((f) => (
                  <li
                    key={f}
                    className="flex items-baseline gap-3 py-3"
                  >
                    <span
                      aria-hidden
                      className="select-none text-[18px] font-bold leading-none text-primary"
                    >
                      ·
                    </span>
                    <span className="text-[14.5px] leading-[1.55] text-foreground">
                      {t(f)}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up?role=OWNER"
                className="mt-7 inline-flex h-12 items-center justify-center gap-1.5 self-start rounded-xl bg-primary px-7 text-[14.5px] font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {t('proprietaires.pricing.success.cta')}
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          </article>
        </div>

        {/* Flow 4 steps — editorial numbered list, hairline-only */}
        <div className="mt-24 lg:mt-28">
          <header className="mb-10 max-w-[640px]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground/55">
              {t('proprietaires.pricing.flow.eyebrow')}
            </span>
            <h3 className="mt-3 text-[clamp(28px,3vw,40px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
              {t('proprietaires.pricing.flow.title')}
            </h3>
          </header>
          <ol className="divide-y divide-border border-y border-border">
            {FLOW_STEPS.map((stepKey, i) => (
              <li
                key={stepKey}
                className="grid grid-cols-[auto_1fr] items-center gap-6 py-6 lg:gap-12 lg:py-8"
              >
                <span className="text-[clamp(36px,4vw,56px)] font-light leading-none tracking-[-0.02em] text-primary tabular-nums">
                  {`0${i + 1}`}
                </span>
                <p className="text-[15px] leading-[1.55] text-foreground sm:text-[16px]">
                  {t(stepKey)}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Comparison — splitted row with massive −78 % pull-quote */}
        <div className="mt-24 border-y border-border py-16 lg:mt-28 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            {/* Left: title + 2 hairline rows */}
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
                {t('proprietaires.pricing.comparison.eyebrow')}
              </span>
              <h3 className="mt-3 text-[clamp(26px,2.8vw,36px)] font-normal leading-[1.15] tracking-[-0.02em] text-foreground">
                {t('proprietaires.pricing.comparison.title')}
              </h3>
              <ul className="mt-8 divide-y divide-border">
                <li className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-semibold text-foreground/55">
                      {t('proprietaires.pricing.comparison.agency.label')}
                    </span>
                    <span className="text-[12.5px] leading-[1.45] text-foreground/55">
                      {t('proprietaires.pricing.comparison.agency.note')}
                    </span>
                  </div>
                  <span className="font-mono text-[15px] tabular-nums text-foreground/40 line-through">
                    {t('proprietaires.pricing.comparison.agency.amount')}
                  </span>
                </li>
                <li className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-semibold text-foreground">
                      {t('proprietaires.pricing.comparison.arytrano.label')}
                    </span>
                    <span className="text-[12.5px] leading-[1.45] text-foreground/70">
                      {t('proprietaires.pricing.comparison.arytrano.note')}
                    </span>
                  </div>
                  <span className="font-mono text-[15px] font-bold tabular-nums text-primary">
                    {t('proprietaires.pricing.comparison.arytrano.amount')}
                  </span>
                </li>
              </ul>
            </div>
            {/* Right: massive savings pull-quote */}
            <div className="flex flex-col items-end">
              <div className="flex items-baseline justify-end font-light leading-none tracking-[-0.045em] text-primary">
                <span className="text-[clamp(80px,10vw,160px)]">
                  {t('proprietaires.pricing.comparison.savingsPercent')}
                </span>
                <span className="text-[clamp(32px,4vw,56px)]">%</span>
              </div>
              <p className="mt-4 max-w-[220px] text-right text-[11px] font-semibold uppercase leading-[1.35] tracking-[0.14em] text-foreground/55">
                {t('proprietaires.pricing.comparison.savingsLabel')}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-14 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/45">
          {t('proprietaires.pricing.disclaimer')}
        </p>
      </div>
    </section>
  )
}

function Faq({ t }: { t: Translator }) {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-[920px] px-6 lg:px-10">
        <header className="mb-8 text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('proprietaires.faq.eyebrow')}
          </span>
          <h2 className="mt-3 text-[clamp(28px,3vw,40px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('proprietaires.faq.title')}
          </h2>
        </header>
        <ProprietairesFaqAccordion
          items={PROPRIETAIRES_FAQ_ITEMS.map((it) => ({
            question: t(it.q),
            answer: t(it.a),
          }))}
        />
      </div>
    </section>
  )
}

function FinalCta({ t }: { t: Translator }) {
  return (
    <section className="bg-background pb-20 lg:pb-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="rounded-[28px] bg-[oklch(0.16_0.025_281)] px-8 py-16 text-center text-white sm:px-12">
          <h2 className="m-0 text-[clamp(32px,3.6vw,48px)] font-normal leading-[1.05] tracking-[-0.025em]">
            {t('proprietaires.finalCta.title')}
          </h2>
          <p className="mx-auto mb-7 mt-3.5 max-w-[560px] text-[16px] leading-[1.55] text-white/80">
            {t('proprietaires.finalCta.lead')}
          </p>
          <Link
            href="/sign-up?role=OWNER"
            className="inline-flex h-13 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-[oklch(0.16_0.025_281)] transition hover:bg-white/90"
          >
            {t('proprietaires.finalCta.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
