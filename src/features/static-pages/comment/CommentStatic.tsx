import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import { Icon, type IconName } from '@/components/shared/Icon'

const STATS: Array<{ n: MessageKey; label: MessageKey; color: string }> = [
  { n: 'comment.why.stat1.n', label: 'comment.why.stat1.label', color: 'oklch(0.75 0.18 25)' },
  { n: 'comment.why.stat2.n', label: 'comment.why.stat2.label', color: 'oklch(0.85 0.15 90)' },
  { n: 'comment.why.stat3.n', label: 'comment.why.stat3.label', color: 'oklch(0.7 0.18 152)' },
  { n: 'comment.why.stat4.n', label: 'comment.why.stat4.label', color: 'oklch(0.85 0.06 277)' },
]

const VERIF: Array<{
  icon: IconName
  title: MessageKey
  desc: MessageKey
  why: MessageKey
}> = [
  { icon: 'shield', title: 'comment.verif.v1.title', desc: 'comment.verif.v1.desc', why: 'comment.verif.v1.why' },
  { icon: 'house', title: 'comment.verif.v2.title', desc: 'comment.verif.v2.desc', why: 'comment.verif.v2.why' },
  { icon: 'eye', title: 'comment.verif.v3.title', desc: 'comment.verif.v3.desc', why: 'comment.verif.v3.why' },
  { icon: 'pin', title: 'comment.verif.v4.title', desc: 'comment.verif.v4.desc', why: 'comment.verif.v4.why' },
  { icon: 'phone', title: 'comment.verif.v5.title', desc: 'comment.verif.v5.desc', why: 'comment.verif.v5.why' },
  { icon: 'message', title: 'comment.verif.v6.title', desc: 'comment.verif.v6.desc', why: 'comment.verif.v6.why' },
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
    <section className="bg-[oklch(0.16_0.025_281)] py-20 text-white lg:py-24">
      <div className="mx-auto grid max-w-[1280px] items-center gap-16 px-6 lg:grid-cols-[1fr_1.4fr] lg:px-10 max-lg:gap-10">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[oklch(0.85_0.06_277)]">
            {t('comment.why.eyebrow')}
          </span>
          <h2 className="mt-3.5 mb-4 font-serif text-[clamp(32px,3.6vw,44px)] font-normal leading-[1.05] tracking-[-0.025em]">
            {t('comment.why.title')}
          </h2>
          <p className="max-w-[460px] text-[15.5px] leading-[1.6] text-[oklch(0.78_0.015_277)]">
            {t('comment.why.p1')}
          </p>
          <p className="mt-3.5 max-w-[460px] text-[15.5px] leading-[1.6] text-[oklch(0.78_0.015_277)]">
            {t('comment.why.p2')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-[oklch(0.28_0.02_277)] bg-[oklch(0.22_0.02_277)] p-5"
            >
              <div
                style={{ color: s.color }}
                className="font-mono text-[36px] font-bold leading-none tracking-[-0.03em]"
              >
                {t(s.n)}
              </div>
              <div className="mt-2 text-[13.5px] font-medium leading-[1.45] text-[oklch(0.78_0.015_277)]">
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
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="mb-12 text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('comment.verif.eyebrow')}
          </span>
          <h2 className="mt-3 font-serif text-[clamp(32px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('comment.verif.title')}
          </h2>
        </header>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {VERIF.map((v) => (
            <li
              key={v.title}
              className="flex flex-col rounded-2xl border border-border bg-background p-5 transition hover:border-primary/40 hover:shadow-md"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name={v.icon} size={22} />
              </span>
              <div className="mt-3.5 text-[17px] font-bold tracking-[-0.01em] text-foreground">
                {t(v.title)}
              </div>
              <div className="mt-2 text-[14px] leading-[1.55] text-foreground/70">
                {t(v.desc)}
              </div>
              <div className="mt-3.5 flex items-start gap-2 border-t border-border pt-3.5 text-[13px] font-medium text-primary">
                <Icon name="check" size={14} className="mt-0.5 shrink-0" />
                <span>{t(v.why)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function CommentDont({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="border-y border-border bg-[oklch(0.985_0.007_80)] py-20 lg:py-24">
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
        <ul className="grid gap-3.5 max-sm:grid-cols-1 sm:grid-cols-2">
          {DONTS.map((k) => (
            <li
              key={k}
              className="flex items-start gap-2.5 text-[14.5px] leading-[1.55] text-foreground"
            >
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
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

export function CommentMoney({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="mb-12 text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('comment.money.eyebrow')}
          </span>
          <h2 className="mt-3 font-serif text-[clamp(32px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('comment.money.title')}
          </h2>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <MoneyArrow
            from={t('comment.money.node.student')}
            to={t('comment.money.node.owner')}
            label={t('comment.money.arrow1.label')}
            bigLabel={t('comment.money.arrow1.amount')}
            sub={t('comment.money.arrow1.sub')}
            color="var(--primary)"
          />
          <MoneyArrow
            from={t('comment.money.node.student')}
            to={t('comment.money.node.aryt')}
            label={t('comment.money.arrow2.label')}
            bigLabel={t('comment.money.arrow2.amount')}
            sub={t('comment.money.arrow2.sub')}
            color="var(--border)"
            struck
          />
          <MoneyArrow
            from={t('comment.money.node.owner')}
            to={t('comment.money.node.aryt')}
            label={t('comment.money.arrow3.label')}
            bigLabel={t('comment.money.arrow3.amount')}
            sub={t('comment.money.arrow3.sub')}
            color="var(--border)"
            struck
          />
        </div>

        <div className="mx-auto mt-10 max-w-[720px] rounded-2xl border border-border bg-[oklch(0.985_0.007_80)] p-7">
          <div className="text-[17px] font-bold tracking-[-0.01em] text-foreground">
            {t('comment.money.tien.title')}
          </div>
          <p className="m-0 mt-2.5 text-[14.5px] leading-[1.6] text-foreground/70">
            {t('comment.money.tien.body')}
          </p>
        </div>
      </div>
    </section>
  )
}

function MoneyArrow({
  from,
  to,
  label,
  bigLabel,
  sub,
  color,
  struck,
}: {
  from: string
  to: string
  label: string
  bigLabel: string
  sub: string
  color: string
  struck?: boolean
}) {
  return (
    <div className="flex flex-col items-stretch gap-3 rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-foreground">{from}</span>
        <span className="text-[13px] font-semibold text-foreground">{to}</span>
      </div>
      <div className="text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="relative h-0.5" style={{ background: color }}>
        <span
          className="absolute -right-0.5 -top-1"
          style={{
            width: 0,
            height: 0,
            borderLeft: `8px solid ${color}`,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
          }}
        />
      </div>
      <div
        className={`text-center text-[22px] font-bold tracking-[-0.02em] ${
          struck ? 'text-muted-foreground line-through' : 'text-foreground'
        }`}
      >
        {struck && <span className="sr-only">Annulé : </span>}
        {bigLabel}
      </div>
      <div className="text-center text-[12px] font-medium text-muted-foreground">
        {sub}
      </div>
    </div>
  )
}
