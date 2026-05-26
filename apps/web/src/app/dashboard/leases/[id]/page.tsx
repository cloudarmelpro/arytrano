import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/features/auth'
import { getLeaseById } from '@/features/leases/queries/get-lease-by-id'
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge'
import { LeaseTenantActions } from '@/features/leases/components/LeaseTenantActions'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { formatAriary } from '@/lib/format/currency'

export const metadata: Metadata = {
  title: 'Bail',
  robots: { index: false, follow: false },
}

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: leaseId } = await params
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/sign-in?next=/dashboard/leases/${leaseId}`)
  }

  const [lease, locale] = await Promise.all([
    getLeaseById(leaseId, session.user.id),
    getLocale(),
  ])
  if (!lease) notFound()
  const t = getT(locale)

  const isOwner = lease.owner.id === session.user.id
  const isTenant = lease.tenant.id === session.user.id

  const startStr = new Date(lease.startDate).toLocaleDateString(
    locale === 'mg' ? 'mg-MG' : 'fr-FR',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )

  return (
    <div className="mx-auto max-w-[920px] px-6 py-12 lg:px-10 lg:py-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-[12px] font-medium text-muted-foreground"
      >
        <Link href="/dashboard/leases" className="transition hover:text-foreground">
          {t('lease.list.title')}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-foreground">{lease.listing.title}</span>
      </nav>

      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span
            aria-hidden
            className="block h-px w-12 bg-primary"
          />
          <span className="mt-5 inline-block text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('lease.detail.eyebrow')}
          </span>
          <h1 className="mt-3.5 font-serif text-[clamp(28px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
            {lease.listing.title}
          </h1>
        </div>
        <LeaseStatusBadge status={lease.status} />
      </header>

      <dl className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="flex flex-col px-0 py-5 sm:pr-6">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
            {t('lease.detail.field.monthlyRent')}
          </dt>
          <dd className="mt-2 font-mono text-[18px] font-bold tabular-nums text-foreground">
            {formatAriary(lease.monthlyRentMGA)}
          </dd>
        </div>
        <div className="flex flex-col px-0 py-5 sm:pl-6">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
            {t('lease.detail.field.caution')}
          </dt>
          <dd className="mt-2 font-mono text-[18px] font-bold tabular-nums text-foreground">
            {formatAriary(lease.cautionMGA)}
          </dd>
        </div>
        <div className="flex flex-col px-0 py-5 sm:pr-6 sm:pt-5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
            {t('lease.detail.field.startDate')}
          </dt>
          <dd className="mt-2 text-[14.5px] font-semibold text-foreground">
            {startStr}
          </dd>
        </div>
        <div className="flex flex-col px-0 py-5 sm:pl-6 sm:pt-5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
            {t('lease.detail.field.duration')}
          </dt>
          <dd className="mt-2 text-[14.5px] font-semibold text-foreground">
            {t('lease.detail.field.durationValue', {
              count: lease.durationMonths,
            })}
          </dd>
        </div>
      </dl>

      <section className="mt-10">
        <h2 className="font-serif text-[clamp(20px,2.2vw,28px)] font-normal leading-[1.15] tracking-[-0.018em] text-foreground">
          {t('lease.detail.parties.title')}
        </h2>
        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
              {t('lease.detail.parties.owner')}
            </dt>
            <dd className="mt-2">
              <p className="text-[14.5px] font-bold text-foreground">
                {lease.owner.name ?? lease.owner.email}
              </p>
              <p className="text-[12.5px] text-foreground/65">
                {lease.owner.email}
              </p>
              {lease.ownerSignedAt ? (
                <p className="mt-1 text-[11.5px] font-medium text-emerald-700">
                  <span aria-hidden>✓</span>{' '}
                  <span>{t('lease.detail.signedAt')}</span>
                </p>
              ) : null}
            </dd>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
              {t('lease.detail.parties.tenant')}
            </dt>
            <dd className="mt-2">
              <p className="text-[14.5px] font-bold text-foreground">
                {lease.tenant.name ?? lease.tenant.email}
              </p>
              <p className="text-[12.5px] text-foreground/65">
                {lease.tenant.email}
              </p>
              {lease.tenantSignedAt ? (
                <p className="mt-1 text-[11.5px] font-medium text-emerald-700">
                  <span aria-hidden>✓</span>{' '}
                  <span>{t('lease.detail.signedAt')}</span>
                </p>
              ) : null}
            </dd>
          </div>
        </dl>
      </section>

      {/* Tenant action area — only shown when the viewing tenant can act */}
      {isTenant && lease.status === 'PENDING_TENANT' ? (
        <section className="mt-10 rounded-2xl border-2 border-primary/15 bg-primary/[0.03] p-6">
          <h2 className="font-serif text-[clamp(20px,2.2vw,28px)] font-normal leading-[1.2] tracking-[-0.018em] text-foreground">
            {t('lease.tenant.title')}
          </h2>
          <p className="mt-2 text-[14.5px] leading-[1.55] text-foreground/65">
            {t('lease.tenant.help')}
          </p>
          <div className="mt-5">
            <LeaseTenantActions leaseId={lease.id} />
          </div>
        </section>
      ) : null}

      {/* Owner waiting state */}
      {isOwner && lease.status === 'PENDING_TENANT' ? (
        <section className="mt-10 rounded-2xl border border-border bg-muted/30 p-6">
          <p className="text-[14.5px] leading-[1.55] text-foreground/70">
            {t('lease.owner.waiting', {
              name: lease.tenant.name ?? lease.tenant.email,
            })}
          </p>
        </section>
      ) : null}
    </div>
  )
}
