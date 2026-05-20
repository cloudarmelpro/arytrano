import Link from 'next/link'
import type { UserRole } from '@prisma/client'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import { Icon, type IconName } from '@/components/shared/Icon'

type OwnerStat = {
  /** Either an i18n key for a hardcoded label, or a literal string (already-resolved real count). */
  n: MessageKey | string
  sub: MessageKey
  icon: IconName
  /** When true, `n` is a plain string instead of an i18n key (skip `t()`). */
  literalN?: boolean
}

type Testimonial = {
  body: string
  authorName: string
  authorMeta: string | null
}

export function LandingOwnerBlock({
  locale,
  role,
  verifiedOwners,
  testimonial,
}: {
  locale: Locale
  role: UserRole | null
  /** Live count from `getLandingStats()` — replaces the hardcoded "168". */
  verifiedOwners: number
  /** Curated owner quote from DB, or `null` when nothing is published yet. */
  testimonial: Testimonial | null
}) {
  if (role === 'OWNER' || role === 'ADMIN') return null
  const t = getT(locale)

  // Stat4 is the only live number — the others are marketing claims
  // (0 commission, 5 min to publish, 24-48h validation SLA).
  const STATS: OwnerStat[] = [
    { n: 'landing.ownerBlock.stat1.n', sub: 'landing.ownerBlock.stat1.sub', icon: 'check' },
    { n: 'landing.ownerBlock.stat2.n', sub: 'landing.ownerBlock.stat2.sub', icon: 'plus' },
    { n: 'landing.ownerBlock.stat3.n', sub: 'landing.ownerBlock.stat3.sub', icon: 'shield' },
    {
      n: String(verifiedOwners),
      sub: 'landing.ownerBlock.stat4.sub',
      icon: 'house',
      literalN: true,
    },
  ]
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[oklch(0.985_0.007_80)] to-white py-20 lg:py-24">
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-14 px-6 lg:grid-cols-[1fr_1.05fr] lg:px-10 max-lg:gap-12">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('landing.ownerBlock.eyebrow')}
          </span>
          <h2 className="mt-3.5 mb-5 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.03em] text-balance text-foreground">
            {t('landing.ownerBlock.title')}
          </h2>
          <p className="mb-8 max-w-[500px] text-[16.5px] leading-[1.55] text-foreground/70">
            {t('landing.ownerBlock.lead')}
          </p>

          <div className="mb-8 grid grid-cols-4 gap-2.5 max-sm:grid-cols-2">
            {STATS.map((s) => (
              <div
                key={s.sub}
                className="flex items-center gap-2.5 rounded-xl bg-white p-3 shadow-[0_1px_3px_rgba(16,18,40,.04)]"
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name={s.icon} size={14} />
                </span>
                <div>
                  <div className="text-[18px] font-bold leading-none tracking-[-0.02em] text-foreground">
                    {s.literalN ? s.n : t(s.n as MessageKey)}
                  </div>
                  <div className="mt-1 text-[11.5px] font-medium text-muted-foreground">
                    {t(s.sub)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up?role=OWNER"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-[14px] text-primary-foreground transition hover:opacity-95"
            >
              {t('landing.ownerBlock.cta')} <Icon name="arrow-right" size={16} />
            </Link>
            <Link
              href="/quartiers"
              className="inline-flex h-12 items-center rounded-xl border border-border bg-white px-6 text-[14px] text-foreground transition hover:bg-muted"
            >
              {t('landing.ownerBlock.ctaSecondary')}
            </Link>
          </div>

          {testimonial ? (
            <div className="mt-8 flex max-w-[500px] gap-3.5 rounded-2xl border border-border bg-white p-5">
              <span
                aria-hidden
                className="h-10 w-10 shrink-0 rounded-full bg-[repeating-linear-gradient(135deg,oklch(0.85_0.06_277)_0_8px,oklch(0.88_0.04_277)_8px_16px)]"
              />
              <div>
                <p className="m-0 text-[14.5px] font-medium leading-[1.5] text-foreground">
                  <span className="mr-1 font-bold text-primary">&ldquo;</span>
                  {testimonial.body}
                  <span className="ml-1 font-bold text-primary">&rdquo;</span>
                </p>
                <div className="mt-1 text-[12.5px] font-medium text-muted-foreground">
                  {testimonial.authorName}
                  {testimonial.authorMeta ? ` — ${testimonial.authorMeta}` : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <DashboardMock t={t} />
      </div>
    </section>
  )
}

function DashboardMock({ t }: { t: ReturnType<typeof getT> }) {
  return (
    // Decorative owner-dashboard preview — no real controls inside.
    // `aria-hidden` + `inert` keep it out of the SR + keyboard tour.
    <div aria-hidden inert className="relative select-none">
      <div className="absolute -top-3 right-4 z-10 flex items-center gap-2.5 rounded-xl border border-border bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(16,18,40,.04),0_4px_12px_rgba(16,18,40,.04)]">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold text-foreground">
            {t('landing.ownerBlock.dashboard.notif.title')}
          </div>
          <div className="text-[11.5px] font-medium text-muted-foreground">
            {t('landing.ownerBlock.dashboard.notif.sub')}
          </div>
        </div>
        <Icon name="whatsapp" size={16} className="text-primary" />
      </div>

      <div className="relative rounded-2xl border border-border bg-white p-6 shadow-[0_1px_2px_rgba(16,18,40,.03),0_8px_24px_-12px_rgba(16,18,40,.08)]">
        <span
          // Explicit "Aperçu" pill so visitors don't read the
          // 47-views / 12-contacts numbers below as their own stats.
          className="absolute -top-3 left-4 inline-flex h-6 items-center rounded-full bg-foreground px-2.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-background"
        >
          {t('landing.ownerBlock.dashboard.previewBadge')}
        </span>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="h-9 w-9 rounded-full bg-[repeating-linear-gradient(135deg,oklch(0.85_0.06_277)_0_8px,oklch(0.88_0.04_277)_8px_16px)]"
            />
            <div>
              <div className="text-[14.5px] font-bold text-foreground">
                {t('landing.ownerBlock.dashboard.author')}
              </div>
              <div className="text-[12px] font-medium text-muted-foreground">
                {t('landing.ownerBlock.dashboard.role')}
              </div>
            </div>
          </div>
          <span className="inline-flex h-6 items-center gap-1 rounded-full bg-emerald-50 px-2.5 text-[11.5px] font-semibold text-emerald-700">
            <Icon name="shield" size={11} /> {t('landing.ownerBlock.dashboard.verified')}
          </span>
        </div>

        <div className="mb-4 flex items-end justify-between border-b border-border pb-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {t('landing.ownerBlock.dashboard.thisWeek')}
            </div>
            <div className="mt-2 flex items-baseline gap-5">
              <Metric n="47" sub={t('landing.ownerBlock.dashboard.views')} />
              <Metric n="12" sub={t('landing.ownerBlock.dashboard.contacts')} />
              <Metric n="3" sub={t('landing.ownerBlock.dashboard.favorites')} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-2.5"
            >
              <div className="h-10 w-10 shrink-0 rounded-md bg-[repeating-linear-gradient(135deg,oklch(0.88_0.04_277)_0_10px,oklch(0.91_0.025_277)_10px_20px)]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-semibold text-foreground">
                  {t(`landing.ownerBlock.dashboard.l${i}.title` as MessageKey)}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <span className="h-1 w-1 rounded-full bg-current" />
                    {t('landing.ownerBlock.dashboard.active')}
                  </span>
                  <span>·</span>
                  <span>{27 - i * 4} {t('landing.ownerBlock.dashboard.views')}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13.5px] font-bold text-foreground">
                  {t(`landing.ownerBlock.dashboard.l${i}.price` as MessageKey)}
                </div>
                <div className="text-[11px] font-medium text-muted-foreground">
                  {t('common.perMonth')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Metric({ n, sub }: { n: string; sub: string }) {
  return (
    <div>
      <span className="text-[22px] font-bold tracking-[-0.02em] text-foreground">
        {n}
      </span>
      <span className="ml-1 text-[12px] font-medium text-muted-foreground">
        {sub}
      </span>
    </div>
  )
}
