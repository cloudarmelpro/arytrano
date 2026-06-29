import type { Metadata } from 'next'
import Link from 'next/link'
import {
  computeDailyAdminStats,
  getAdminStats,
} from '@/features/admin/server'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('admin.overview.title') }
}

export default async function AdminOverviewPage() {
  const [stats, daily, locale] = await Promise.all([
    getAdminStats(),
    computeDailyAdminStats(),
    getLocale(),
  ])
  const t = getT(locale)

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {t('admin.overview.title')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('admin.overview.lead')}
        </p>
      </header>

      <Link
        href="/admin/reports"
        className="group flex items-center justify-between gap-4 rounded-xl bg-muted/40 p-6 transition hover:bg-primary/5"
      >
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('admin.stats.reports.open')}
          </p>
          <p className="font-mono text-4xl font-semibold text-foreground transition group-hover:text-primary">
            {stats.reports.open}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.stats.reports.lead')}
          </p>
        </div>
        <svg
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>

      {/* ADM-01 — Activity (DAU / WAU / MAU). Computed via distinct
          LoginEvent userIds, so it counts authenticated activity, not
          raw page views. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">Activité utilisateurs</h2>
        <p className="text-xs text-muted-foreground">
          Utilisateurs uniques connectés. Fenêtre = j-1 UTC (DAU), 7 derniers jours (WAU), 30 derniers jours (MAU).
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="DAU" value={daily.activity.dau} hint="jour précédent" />
          <StatCard label="WAU" value={daily.activity.wau} hint="7 derniers jours" />
          <StatCard label="MAU" value={daily.activity.mau} hint="30 derniers jours" />
        </div>
      </section>

      {/* ADM-01 — Signups funnel. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">Inscriptions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Aujourd’hui" value={daily.signups.today} />
          <StatCard label="7 derniers jours" value={daily.signups.last7d} />
          <StatCard label="30 derniers jours" value={daily.signups.last30d} />
          <StatCard label="Total" value={daily.signups.total} />
        </div>
      </section>

      {/* ADM-01 — Engagement. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">Engagement (j-1)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Contacts" value={daily.engagement.contactsToday} />
          <StatCard label="Favoris" value={daily.engagement.favoritesToday} />
          <StatCard label="Vues annonces" value={daily.engagement.viewsToday} />
          <StatCard label="Contacts 7j" value={daily.engagement.contactsLast7d} />
        </div>
      </section>

      {/* Listings breakdown — kept from the previous overview. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">
          {t('admin.nav.listings')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label={t('admin.stats.listings.total')} value={stats.listings.total} />
          <StatCard label={t('admin.stats.listings.published')} value={stats.listings.PUBLISHED} />
          <StatCard
            label="Publiées j-1"
            value={daily.listings.publishedTodayNew}
          />
          <StatCard label="Drafts j-1" value={daily.listings.draftToday} />
          <StatCard label={t('admin.stats.listings.unavailable')} value={stats.listings.UNAVAILABLE} />
          <StatCard label={t('admin.stats.listings.suspended')} value={stats.listings.SUSPENDED} />
        </div>
      </section>

      {/* Leases + payments. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">Baux & paiements (j-1)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Baux initiés" value={daily.leases.initiatedToday} />
          <StatCard label="Baux activés" value={daily.leases.activatedToday} />
          <StatCard label="Paiements OK" value={daily.payments.paidToday} />
          <StatCard label="Remboursements" value={daily.payments.refundedToday} />
        </div>
      </section>

      {/* Users + moderation snapshots from the live counter query. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">
          {t('admin.stats.users.total')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t('admin.stats.users.total')} value={stats.users.total} />
          <StatCard label={t('admin.stats.users.owners')} value={stats.users.OWNER} />
          <StatCard label={t('admin.stats.users.students')} value={stats.users.STUDENT} />
          <StatCard
            label="CIN à vérifier"
            value={daily.moderation.pendingVerifications}
          />
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-muted/40 p-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <p className="font-mono text-3xl font-semibold text-foreground">{value}</p>
      {hint ? (
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  )
}
