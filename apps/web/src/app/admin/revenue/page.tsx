import type { Metadata } from 'next'
import { getRevenueStats, listRecentPayments } from '@/features/admin-revenue'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT, type Translator } from '@/lib/i18n/translate'
import { formatAriary } from '@/lib/format/currency'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return {
    title: t('admin.revenue.title'),
    robots: { index: false, follow: false },
  }
}

export default async function AdminRevenuePage() {
  const [stats, recent, locale] = await Promise.all([
    getRevenueStats(),
    listRecentPayments(30),
    getLocale(),
  ])
  const t = getT(locale)

  const dateFormatter = new Intl.DateTimeFormat(
    locale === 'mg' ? 'fr-FR' : 'fr-FR',
    { dateStyle: 'short', timeStyle: 'short' },
  )

  const monthDelta =
    stats.lastMonthMGA > 0
      ? Math.round(
          ((stats.thisMonthMGA - stats.lastMonthMGA) / stats.lastMonthMGA) *
            100,
        )
      : null

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {t('admin.revenue.title')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('admin.revenue.lead')}
        </p>
      </header>

      {/* KPI tiles — success-fee model (no MRR). */}
      <section
        aria-labelledby="kpi-heading"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <h2 id="kpi-heading" className="sr-only">
          {t('admin.revenue.kpi.heading')}
        </h2>
        <Kpi
          label={t('admin.revenue.kpi.thisMonth')}
          value={formatAriary(stats.thisMonthMGA)}
          hint={t('admin.revenue.kpi.thisMonth.hint', {
            count: stats.thisMonthCount,
          })}
          delta={
            monthDelta !== null
              ? {
                  pct: monthDelta,
                  label: t('admin.revenue.kpi.vsLastMonth'),
                }
              : null
          }
        />
        <Kpi
          label={t('admin.revenue.kpi.lastMonth')}
          value={formatAriary(stats.lastMonthMGA)}
          hint={t('admin.revenue.kpi.lastMonth.hint', {
            count: stats.lastMonthCount,
          })}
        />
        <Kpi
          label={t('admin.revenue.kpi.allTime')}
          value={formatAriary(stats.allTimeMGA)}
          hint={t('admin.revenue.kpi.allTime.hint', {
            count: stats.allTimeCount,
          })}
        />
        <Kpi
          label={t('admin.revenue.kpi.signedThisMonth')}
          value={String(stats.signedLeasesThisMonth)}
          hint={t('admin.revenue.kpi.signedThisMonth.hint')}
        />
      </section>

      {/* Health row — dispute rate + refund queue. */}
      <section
        aria-labelledby="health-heading"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <h2 id="health-heading" className="sr-only">
          {t('admin.revenue.health.heading')}
        </h2>
        <Kpi
          label={t('admin.revenue.kpi.disputeRate')}
          value={
            stats.disputeRatePct === null
              ? t('admin.revenue.kpi.disputeRate.na')
              : `${stats.disputeRatePct.toFixed(2)} %`
          }
          hint={t('admin.revenue.kpi.disputeRate.hint')}
          tone={
            stats.disputeRatePct !== null && stats.disputeRatePct > 5
              ? 'warning'
              : undefined
          }
        />
        <Kpi
          label={t('admin.revenue.kpi.refundQueue')}
          value={String(stats.refundCount)}
          hint={t('admin.revenue.kpi.refundQueue.hint')}
          tone={stats.refundCount > 0 ? 'warning' : undefined}
        />
      </section>

      {/* Status breakdown table. */}
      <section aria-labelledby="status-heading" className="flex flex-col gap-4">
        <h2
          id="status-heading"
          className="text-lg font-semibold text-foreground"
        >
          {t('admin.revenue.status.title')}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">
              {t('admin.revenue.status.caption')}
            </caption>
            <thead className="border-b border-border bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2.5">
                  {t('admin.revenue.status.column.status')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-right">
                  {t('admin.revenue.status.column.count')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Object.entries(stats.statusBreakdown).length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    {t('admin.revenue.status.empty')}
                  </td>
                </tr>
              ) : (
                Object.entries(stats.statusBreakdown).map(([status, count]) => (
                  <tr key={status}>
                    <td className="px-4 py-2.5 font-mono text-[12.5px]">
                      {status}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent payments table — last 30. */}
      <section aria-labelledby="recent-heading" className="flex flex-col gap-4">
        <h2
          id="recent-heading"
          className="text-lg font-semibold text-foreground"
        >
          {t('admin.revenue.recent.title')}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">
              {t('admin.revenue.recent.caption')}
            </caption>
            <thead className="border-b border-border bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2.5">
                  {t('admin.revenue.recent.column.date')}
                </th>
                <th scope="col" className="px-4 py-2.5">
                  {t('admin.revenue.recent.column.listing')}
                </th>
                <th scope="col" className="px-4 py-2.5">
                  {t('admin.revenue.recent.column.status')}
                </th>
                <th scope="col" className="px-4 py-2.5 text-right">
                  {t('admin.revenue.recent.column.amount')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {t('admin.revenue.recent.empty')}
                  </td>
                </tr>
              ) : (
                recent.map((p) => (
                  <PaymentRow
                    key={p.id}
                    p={p}
                    t={t}
                    formatDate={dateFormatter.format}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Kpi({
  label,
  value,
  hint,
  delta,
  tone,
}: {
  label: string
  value: string
  hint: string
  delta?: { pct: number; label: string } | null
  tone?: 'warning'
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-xl border p-5 ${
        tone === 'warning'
          ? 'border-amber-300 bg-amber-50/50'
          : 'border-border bg-background'
      }`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
        {value}
      </span>
      {delta ? (
        <span
          className={`text-[11px] font-semibold ${
            delta.pct >= 0 ? 'text-emerald-700' : 'text-destructive'
          }`}
        >
          {delta.pct >= 0 ? '+' : ''}
          {delta.pct} % {delta.label}
        </span>
      ) : null}
      <span className="text-[12px] text-muted-foreground">{hint}</span>
    </div>
  )
}

function PaymentRow({
  p,
  t,
  formatDate,
}: {
  p: Awaited<ReturnType<typeof listRecentPayments>>[number]
  t: Translator
  formatDate: (d: Date) => string
}) {
  const displayDate = p.completedAt ?? p.createdAt
  return (
    <tr>
      <td className="px-4 py-2.5 align-top font-mono text-[12px] text-muted-foreground">
        {formatDate(displayDate)}
      </td>
      <td className="px-4 py-2.5 align-top">
        <p className="font-medium text-foreground">
          {p.lease?.listing.title ?? t('admin.revenue.recent.row.noListing')}
        </p>
        {p.providerTxId ? (
          <p className="font-mono text-[11px] text-muted-foreground">
            tx: {p.providerTxId}
          </p>
        ) : null}
      </td>
      <td className="px-4 py-2.5 align-top">
        <span className="inline-flex rounded-md border border-current/30 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.05em]">
          {p.status}
        </span>
      </td>
      <td className="px-4 py-2.5 text-right align-top font-mono font-semibold tabular-nums">
        {formatAriary(p.amountMGA)}
      </td>
    </tr>
  )
}
