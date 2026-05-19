import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT, type Translator } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import { Icon, type IconName } from '@/components/shared/Icon'

const STEPS: Array<{ n: string; icon: IconName; title: MessageKey; desc: MessageKey }> = [
  { n: '01', icon: 'message', title: 'proprietaires.steps.s1.title', desc: 'proprietaires.steps.s1.desc' },
  { n: '02', icon: 'shield', title: 'proprietaires.steps.s2.title', desc: 'proprietaires.steps.s2.desc' },
  { n: '03', icon: 'house', title: 'proprietaires.steps.s3.title', desc: 'proprietaires.steps.s3.desc' },
  { n: '04', icon: 'whatsapp', title: 'proprietaires.steps.s4.title', desc: 'proprietaires.steps.s4.desc' },
]

const VERIF_ITEMS: Array<{ title: MessageKey; desc: MessageKey }> = [
  { title: 'proprietaires.verif.i1.title', desc: 'proprietaires.verif.i1.desc' },
  { title: 'proprietaires.verif.i2.title', desc: 'proprietaires.verif.i2.desc' },
  { title: 'proprietaires.verif.i3.title', desc: 'proprietaires.verif.i3.desc' },
  { title: 'proprietaires.verif.i4.title', desc: 'proprietaires.verif.i4.desc' },
]

const STANDARD_F: MessageKey[] = [
  'proprietaires.pricing.standard.f1',
  'proprietaires.pricing.standard.f2',
  'proprietaires.pricing.standard.f3',
  'proprietaires.pricing.standard.f4',
  'proprietaires.pricing.standard.f5',
]
const PREMIUM_F: MessageKey[] = [
  'proprietaires.pricing.premium.f1',
  'proprietaires.pricing.premium.f2',
  'proprietaires.pricing.premium.f3',
  'proprietaires.pricing.premium.f4',
  'proprietaires.pricing.premium.f5',
  'proprietaires.pricing.premium.f6',
]

const FAQ: Array<{ q: MessageKey; a: MessageKey }> = [
  { q: 'proprietaires.faq.q1.q', a: 'proprietaires.faq.q1.a' },
  { q: 'proprietaires.faq.q2.q', a: 'proprietaires.faq.q2.a' },
  { q: 'proprietaires.faq.q3.q', a: 'proprietaires.faq.q3.a' },
  { q: 'proprietaires.faq.q4.q', a: 'proprietaires.faq.q4.a' },
  { q: 'proprietaires.faq.q5.q', a: 'proprietaires.faq.q5.a' },
  { q: 'proprietaires.faq.q6.q', a: 'proprietaires.faq.q6.a' },
]

export function ProprietairesPage({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <>
      <Hero t={t} />
      <PublishSteps t={t} />
      <Verification t={t} />
      <Pricing t={t} />
      <Faq t={t} />
      <FinalCta t={t} />
    </>
  )
}

function Hero({ t }: { t: Translator }) {
  return (
    <section className="relative isolate overflow-hidden bg-background py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:px-10 max-lg:gap-10">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('proprietaires.hero.eyebrow')}
          </span>
          <h1 className="mt-3.5 font-serif text-[clamp(36px,4.6vw,64px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
            {t('proprietaires.hero.title')}
          </h1>
          <p className="mt-4 max-w-[520px] text-[16.5px] leading-[1.6] text-foreground/70">
            {t('proprietaires.hero.sub')}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="#publier"
              className="inline-flex h-13 items-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              {t('proprietaires.hero.ctaPrimary')} <Icon name="arrow-right" size={16} />
            </Link>
            <Link
              href="#tarifs"
              className="inline-flex h-13 items-center rounded-xl border border-border bg-background px-6 text-[15px] font-semibold text-foreground transition hover:bg-muted"
            >
              {t('proprietaires.hero.ctaSecondary')}
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-6 max-sm:grid-cols-1">
            {(
              [
                { n: 'proprietaires.hero.stat1.n', l: 'proprietaires.hero.stat1.label' },
                { n: 'proprietaires.hero.stat2.n', l: 'proprietaires.hero.stat2.label' },
                { n: 'proprietaires.hero.stat3.n', l: 'proprietaires.hero.stat3.label' },
              ] satisfies Array<{ n: MessageKey; l: MessageKey }>
            ).map((s) => (
              <div key={s.l}>
                <div className="text-[28px] font-bold tracking-[-0.02em] text-foreground">
                  {t(s.n)}
                </div>
                <div className="mt-1 text-[12.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                  {t(s.l)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <PublishPreview t={t} />
      </div>
    </section>
  )
}

function PublishPreview({ t }: { t: Translator }) {
  return (
    <div
      // Decorative wizard mock — buttons inside are not interactive.
      // `aria-hidden` keeps SR + keyboard users from landing on dead controls.
      aria-hidden
      inert
      className="overflow-hidden rounded-2xl border border-border bg-background shadow-lg select-none"
    >
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
        <span className="h-2 w-2 rounded-full bg-[oklch(0.75_0.18_25)]" />
        <span className="h-2 w-2 rounded-full bg-[oklch(0.85_0.15_90)]" />
        <span className="h-2 w-2 rounded-full bg-[oklch(0.7_0.18_152)]" />
        <span className="ml-2 font-mono text-[12px] text-muted-foreground">
          {t('proprietaires.preview.url')}
        </span>
      </div>
      <div className="p-6">
        <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {t('proprietaires.preview.step')}
        </div>
        <div className="mt-2 text-[22px] font-bold tracking-[-0.015em] text-foreground">
          {t('proprietaires.preview.title')}
        </div>
        <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-3/4 bg-primary" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {(
            [
              ['proprietaires.preview.field.type', 'proprietaires.preview.field.typeV'],
              ['proprietaires.preview.field.quartier', 'proprietaires.preview.field.quartierV'],
              ['proprietaires.preview.field.surface', 'proprietaires.preview.field.surfaceV'],
              ['proprietaires.preview.field.price', 'proprietaires.preview.field.priceV'],
            ] satisfies Array<readonly [MessageKey, MessageKey]>
          ).map(([labelKey, valueKey]) => (
            <div
              key={labelKey}
              className="rounded-lg border border-border bg-background px-3 py-2.5"
            >
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                {t(labelKey)}
              </div>
              <div className="mt-0.5 text-[14px] font-semibold text-foreground">
                {t(valueKey)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            {t('proprietaires.preview.photos')}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-[repeating-linear-gradient(135deg,oklch(0.92_0.025_70)_0_8px,oklch(0.95_0.018_70)_8px_16px)]"
              />
            ))}
            <div className="flex aspect-square items-center justify-center rounded-lg border-[1.5px] border-dashed border-border text-muted-foreground">
              <Icon name="plus" size={20} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-between gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-[13.5px] font-semibold text-foreground"
          >
            {t('proprietaires.preview.prev')}
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13.5px] font-semibold text-primary-foreground"
          >
            {t('proprietaires.preview.next')} <Icon name="arrow-right" size={13} />
          </button>
        </div>
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
          <h2 className="mt-3 font-serif text-[clamp(32px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('proprietaires.steps.title')}
          </h2>
        </header>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="flex flex-col rounded-2xl border border-border bg-background p-5"
            >
              <div className="font-mono text-[12px] font-semibold tracking-[0.06em] text-primary">
                {s.n}
              </div>
              <span className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name={s.icon} size={22} />
              </span>
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
    <section
      id="verif"
      className="border-y border-border bg-[oklch(0.985_0.007_80)] py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1280px] items-start gap-12 px-6 lg:grid-cols-[1.1fr_1fr] lg:px-10 max-lg:gap-10">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('proprietaires.verif.eyebrow')}
          </span>
          <h2 className="mt-3.5 font-serif text-[clamp(32px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
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
    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-[repeating-linear-gradient(135deg,oklch(0.85_0.06_130)_0_8px,oklch(0.88_0.04_130)_8px_16px)]" />
        <div className="min-w-0">
          <div className="text-[16px] font-bold text-foreground">
            {t('proprietaires.verif.card.author')}
          </div>
          <div className="text-[12.5px] font-medium text-muted-foreground">
            {t('proprietaires.verif.card.verifiedAt')}
          </div>
        </div>
        <span className="ml-auto inline-flex h-6 items-center gap-1 rounded-full bg-emerald-50 px-2.5 text-[11.5px] font-semibold text-emerald-700">
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
  )
}

function Pricing({ t }: { t: Translator }) {
  return (
    <section id="tarifs" className="bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="mb-10 text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('proprietaires.pricing.eyebrow')}
          </span>
          <h2 className="mt-3 font-serif text-[clamp(32px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('proprietaires.pricing.title')}
          </h2>
          <p className="mx-auto mt-3.5 max-w-[540px] text-[16px] text-muted-foreground">
            {t('proprietaires.pricing.lead')}
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-2">
          <PricingCard
            t={t}
            name={t('proprietaires.pricing.standard.name')}
            price={t('proprietaires.pricing.standard.price')}
            sub={t('proprietaires.pricing.standard.sub')}
            features={STANDARD_F}
            cta={t('proprietaires.pricing.standard.cta')}
          />
          <PricingCard
            t={t}
            name={t('proprietaires.pricing.premium.name')}
            price={t('proprietaires.pricing.premium.price')}
            sub={t('proprietaires.pricing.premium.sub')}
            features={PREMIUM_F}
            cta={t('proprietaires.pricing.premium.cta')}
            highlight
            badge={t('proprietaires.pricing.premium.badge')}
          />
        </div>
        <p className="mt-6 text-center font-mono text-[13px] text-muted-foreground">
          {t('proprietaires.pricing.disclaimer')}
        </p>
      </div>
    </section>
  )
}

function PricingCard({
  t,
  name,
  price,
  sub,
  features,
  cta,
  highlight,
  badge,
}: {
  t: Translator
  name: string
  price: string
  sub: string
  features: MessageKey[]
  cta: string
  highlight?: boolean
  badge?: string
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-background p-7 ${
        highlight ? 'border-primary shadow-md' : 'border-border'
      }`}
    >
      {highlight && badge && (
        <span className="absolute right-3.5 top-3.5 inline-flex h-6 items-center rounded-full bg-primary/10 px-2.5 text-[11.5px] font-semibold text-primary">
          {badge}
        </span>
      )}
      <div
        className={`text-[13px] font-semibold uppercase tracking-[0.06em] ${
          highlight ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {name}
      </div>
      <div className="mt-3.5 flex items-baseline gap-2">
        <span className="text-[44px] font-bold tracking-[-0.03em] text-foreground">
          {price}
        </span>
        <span className="text-[14px] font-medium text-muted-foreground">
          {t('proprietaires.pricing.priceSuffix')}
        </span>
      </div>
      <div className="mt-1 text-[13.5px] font-medium text-muted-foreground">{sub}</div>
      <ul className="my-7 flex flex-col gap-3">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-[14px] text-foreground">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Icon name="check" size={12} />
            </span>
            {t(f)}
          </li>
        ))}
      </ul>
      <Link
        href="/sign-up?role=OWNER"
        className={`mt-auto inline-flex h-12 items-center justify-center rounded-xl text-[14.5px] font-semibold transition ${
          highlight
            ? 'bg-primary text-primary-foreground hover:opacity-95'
            : 'border border-border bg-background text-foreground hover:bg-muted'
        }`}
      >
        {cta}
      </Link>
    </div>
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
          <h2 className="mt-3 font-serif text-[clamp(28px,3vw,40px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('proprietaires.faq.title')}
          </h2>
        </header>
        <ul className="flex flex-col gap-2">
          {FAQ.map((it, i) => (
            <li key={i}>
              <details className="group rounded-2xl border border-border bg-background p-5 transition hover:border-primary/40 open:border-primary/60 open:bg-muted/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="text-[15.5px] font-semibold text-foreground">
                    {t(it.q)}
                  </span>
                  <span
                    aria-hidden
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground"
                  >
                    <Icon name="plus" size={16} />
                  </span>
                </summary>
                <p className="mt-3 text-[14.5px] leading-[1.6] text-foreground/70">
                  {t(it.a)}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function FinalCta({ t }: { t: Translator }) {
  return (
    <section className="bg-background pb-20 lg:pb-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="rounded-[28px] bg-[oklch(0.16_0.025_281)] px-8 py-16 text-center text-white sm:px-12">
          <h2 className="m-0 font-serif text-[clamp(32px,3.6vw,48px)] font-normal leading-[1.05] tracking-[-0.025em]">
            {t('proprietaires.finalCta.title')}
          </h2>
          <p className="mx-auto mb-7 mt-3.5 max-w-[560px] text-[16px] leading-[1.55] text-white/80">
            {t('proprietaires.finalCta.lead')}
          </p>
          <Link
            href="/sign-up?role=OWNER"
            className="inline-flex h-13 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-primary transition hover:bg-[oklch(0.97_0.012_90)]"
          >
            {t('proprietaires.finalCta.cta')} <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
