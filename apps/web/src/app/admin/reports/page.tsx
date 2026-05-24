import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReportReason, ReportStatus } from '@prisma/client'
import { listReports, listReportsQuerySchema } from '@/features/admin/server'
import { ReportActions } from '@/features/admin'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT, type Translator } from '@/lib/i18n/translate'

type SearchParams = Promise<{ status?: string }>

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('admin.reports.title') }
}

const STATUS_BADGE: Record<ReportStatus, string> = {
  OPEN: 'bg-destructive/10 text-destructive',
  IN_REVIEW: 'bg-secondary/40 text-secondary-foreground',
  RESOLVED: 'bg-success/10 text-success',
  DISMISSED: 'bg-muted/40 text-muted-foreground',
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [sp, locale] = await Promise.all([searchParams, getLocale()])
  const t = getT(locale)
  const parsed = listReportsQuerySchema.safeParse({ status: sp.status || undefined })
  const query = parsed.success ? parsed.data : {}
  const items = await listReports(query)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {t('admin.reports.title')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('admin.reports.lead')}
        </p>
      </header>

      <StatusFilters current={query.status} t={t} />

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-base font-medium">{t('admin.reports.empty.title')}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t('admin.reports.empty.lead')}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((r) => (
            <ReportCard key={r.id} report={r} t={t} />
          ))}
        </ul>
      )}
    </div>
  )
}

function StatusFilters({
  current,
  t,
}: {
  current: ReportStatus | undefined
  t: Translator
}) {
  const tabs: Array<{ value: ReportStatus | ''; label: string }> = [
    { value: '', label: t('admin.reports.filter.all') },
    { value: 'OPEN', label: t('admin.reports.status.OPEN') },
    { value: 'IN_REVIEW', label: t('admin.reports.status.IN_REVIEW') },
    { value: 'RESOLVED', label: t('admin.reports.status.RESOLVED') },
    { value: 'DISMISSED', label: t('admin.reports.status.DISMISSED') },
  ]
  return (
    <nav className="flex flex-wrap gap-2" aria-label={t('admin.reports.filter.status')}>
      {tabs.map((tab) => {
        const active = (current ?? '') === tab.value
        const href = tab.value ? `/admin/reports?status=${tab.value}` : '/admin/reports'
        return (
          <Link
            key={tab.value || 'all'}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition ${
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}

function ReportCard({
  report,
  t,
}: {
  report: {
    id: string
    reason: ReportReason
    details: string | null
    adminNote: string | null
    status: ReportStatus
    createdAt: Date
    listing: { slug: string; title: string; citySlug: string; neighborhoodSlug: string }
    reporter: { name: string | null; email: string } | null
  }
  t: Translator
}) {
  const isActive = report.status === 'OPEN' || report.status === 'IN_REVIEW'
  const listingHref = `/${report.listing.citySlug}/${report.listing.neighborhoodSlug}/${report.listing.slug}`
  return (
    <li className="flex flex-col gap-3 rounded-xl bg-muted/30 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium ${STATUS_BADGE[report.status]}`}
        >
          {t(`admin.reports.status.${report.status}` as const)}
        </span>
        <span className="text-sm font-medium text-foreground">
          {t(`report.reason.${report.reason}` as const)}
        </span>
        <span className="text-xs text-muted-foreground">
          {report.createdAt.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      </div>

      <p className="text-sm">
        <Link href={listingHref} className="font-medium text-primary hover:underline">
          {report.listing.title}
        </Link>
      </p>

      <p className="text-xs text-muted-foreground">
        {t('admin.reports.reportedBy')}:{' '}
        {report.reporter
          ? `${report.reporter.name ?? '—'} (${report.reporter.email})`
          : t('admin.reports.anonymous')}
      </p>

      {report.details && (
        <details className="text-sm">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
            {t('admin.reports.details')}
          </summary>
          <p className="mt-1 whitespace-pre-wrap rounded-md bg-background p-3 text-sm leading-relaxed">
            {report.details}
          </p>
        </details>
      )}

      {report.adminNote && (
        <div className="rounded-md bg-primary/5 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t('admin.reports.adminNote')}
          </p>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground">
            {report.adminNote}
          </p>
        </div>
      )}

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={listingHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary/80"
        >
          <IconExternal />
          {t('admin.reports.viewListing')}
        </Link>
        {isActive && <ReportActions reportId={report.id} />}
      </div>
    </li>
  )
}

function IconExternal() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
