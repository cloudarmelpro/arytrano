import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminStats } from '@/features/admin/server'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('admin.overview.title') }
}

export default async function AdminOverviewPage() {
  const [stats, locale] = await Promise.all([getAdminStats(), getLocale()])
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

      {/* Reports — highlighted at the top because that's the daily admin workload. */}
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

      {/* Listings breakdown */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">
          {t('admin.nav.listings')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label={t('admin.stats.listings.total')} value={stats.listings.total} />
          <StatCard label={t('admin.stats.listings.published')} value={stats.listings.PUBLISHED} />
          <StatCard label={t('admin.stats.listings.draft')} value={stats.listings.DRAFT} />
          <StatCard label={t('admin.stats.listings.unavailable')} value={stats.listings.UNAVAILABLE} />
          <StatCard label={t('admin.stats.listings.suspended')} value={stats.listings.SUSPENDED} />
          <StatCard label={t('admin.stats.listings.deleted')} value={stats.listings.DELETED} />
        </div>
      </section>

      {/* Users */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">
          {t('admin.stats.users.total')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label={t('admin.stats.users.total')} value={stats.users.total} />
          <StatCard label={t('admin.stats.users.owners')} value={stats.users.OWNER} />
          <StatCard label={t('admin.stats.users.students')} value={stats.users.STUDENT} />
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <p className="font-mono text-3xl font-semibold text-foreground">{value}</p>
    </div>
  )
}
