import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { LeaseStatus } from '@prisma/client'
import { auth } from '@/features/auth'
import { getLeaseById } from '@/features/leases/queries/get-lease-by-id'
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge'
import { DownloadLeasePdfButton } from '@/features/leases/components/DownloadLeasePdfButton'
import { LeaseTenantActions } from '@/features/leases/components/LeaseTenantActions'
import { LeaseOwnerCancel } from '@/features/leases/components/LeaseOwnerCancel'
import { buttonVariants } from '@/components/ui/button'
import { getLocale } from '@/lib/i18n/get-locale'
import type { Locale } from '@/lib/i18n/config'
import { getT, type Translator } from '@/lib/i18n/translate'
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

  const startStr = formatDate(lease.startDate, locale)
  const ownerSignedStr = lease.ownerSignedAt
    ? formatDate(lease.ownerSignedAt, locale)
    : null
  const tenantSignedStr = lease.tenantSignedAt
    ? formatDate(lease.tenantSignedAt, locale)
    : null

  // Short reference visible in the eyebrow — last 6 chars of the cuid
  // are enough to disambiguate visually without exposing the full id.
  const refShort = lease.id.slice(-6)

  return (
    <div className="mx-auto max-w-[920px] px-6 lg:px-10">
      {/* Breadcrumb — small, hugging the column top so the column
          ranks visually with the sidebar's first section label.
          Tight `mb-3` keeps the eyebrow/H1 close behind. */}
      <nav
        aria-label="Breadcrumb"
        className="mb-3 flex items-center gap-2 text-[11.5px] font-medium text-foreground/55"
      >
        <Link
          href="/dashboard/leases"
          className="transition hover:text-foreground"
        >
          {t('lease.list.title')}
        </Link>
        <span aria-hidden>›</span>
        <span className="truncate text-foreground/85">
          {lease.listing.title}
        </span>
      </nav>

      {/* Hero — listing title + status next step.
          Removed the standalone 1px decoration bar : the breadcrumb
          already anchors the column visually, so the bar was just
          adding vertical noise. */}
      <header className="mb-12">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          <span>{t('lease.detail.eyebrow')}</span>
          <span aria-hidden className="text-foreground/30">·</span>
          <span className="font-mono normal-case tracking-[0.06em] text-foreground/55">
            {t('lease.detail.reference', { ref: refShort })}
          </span>
        </div>
        <h1 className="mt-3 font-serif text-[clamp(28px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground text-balance">
          {lease.listing.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <LeaseStatusBadge status={lease.status} />
          <p className="text-[13.5px] leading-[1.55] text-foreground/65">
            {statusNextText(t, lease.status, isOwner, isTenant)}
          </p>
          {/* E-T27.1 — lease PDF download. Visible only on ACTIVE leases
              (PDF generation is triggered by the ACTIVE transition). */}
          {lease.status === 'ACTIVE' ? (
            <DownloadLeasePdfButton
              leaseId={lease.id}
              isAvailable={Boolean(lease.contractPdfPublicId)}
            />
          ) : null}
        </div>
      </header>

      {/* Financial recap — magazine pull-quote */}
      <section
        aria-labelledby="lease-detail-financial-heading"
        className="rounded-2xl border border-border bg-muted/25 p-6 lg:p-8"
      >
        <h2
          id="lease-detail-financial-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/55"
        >
          {t('lease.detail.financial.title')}
        </h2>
        <dl className="mt-5 flex flex-col divide-y divide-border/70">
          <FinancialRow
            label={t('lease.detail.field.monthlyRent')}
            value={formatAriary(lease.monthlyRentMGA)}
          />
          <FinancialRow
            label={t('lease.detail.field.caution')}
            value={
              lease.cautionMGA > 0 ? formatAriary(lease.cautionMGA) : '0 Ar'
            }
          />
          {/* Platform fee — shown to BOTH parties for transparency. The
              tenant sees "you pay this", the owner sees "tenant pays this". */}
          <FinancialRow
            label={t('lease.detail.financial.platformFee')}
            value={formatAriary(lease.platformFeeMGA)}
            highlight
            sublabel={
              isTenant
                ? t('lease.detail.financial.platformFee.tenantPays')
                : t('lease.detail.financial.platformFee.ownerInfo')
            }
          />
        </dl>
        <p className="mt-6 text-[12.5px] leading-[1.6] text-foreground/55">
          {t('lease.detail.financial.timing', {
            months: lease.durationMonths,
            date: startStr,
          })}
        </p>
      </section>

      {/* Parties */}
      <section className="mt-10" aria-labelledby="lease-detail-parties-heading">
        <h2
          id="lease-detail-parties-heading"
          className="font-serif text-[clamp(20px,2.2vw,28px)] font-normal leading-[1.15] tracking-[-0.018em] text-foreground"
        >
          {t('lease.detail.parties.title')}
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PartyCard
            roleLabel={t('lease.detail.parties.owner')}
            name={lease.owner.name ?? lease.owner.email}
            email={lease.owner.email}
            signedOnLabel={
              ownerSignedStr
                ? t('lease.detail.signedOn', { date: ownerSignedStr })
                : null
            }
            pendingLabel={
              !ownerSignedStr ? t('lease.detail.pendingAction') : null
            }
            isYou={isOwner}
            youLabel={t('lease.detail.you')}
          />
          <PartyCard
            roleLabel={t('lease.detail.parties.tenant')}
            name={lease.tenant.name ?? lease.tenant.email}
            email={lease.tenant.email}
            signedOnLabel={
              tenantSignedStr
                ? t('lease.detail.signedOn', { date: tenantSignedStr })
                : null
            }
            pendingLabel={
              !tenantSignedStr ? t('lease.detail.pendingAction') : null
            }
            isYou={isTenant}
            youLabel={t('lease.detail.you')}
          />
        </div>
      </section>

      {/* Tenant pay action — only when the viewer is the tenant + still pending */}
      {isTenant && lease.status === 'PENDING_TENANT' ? (
        <section
          className="mt-12 rounded-2xl border border-primary/20 bg-primary/[0.04] p-7 lg:p-9"
          aria-labelledby="lease-tenant-action-heading"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('lease.detail.pendingAction')}
          </span>
          <h2
            id="lease-tenant-action-heading"
            className="mt-2 font-serif text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.2] tracking-[-0.018em] text-foreground"
          >
            {t('lease.tenant.title')}
          </h2>
          <p className="mt-2 max-w-[560px] text-[14.5px] leading-[1.55] text-foreground/65">
            {t('lease.tenant.help')}
          </p>
          <div className="mt-6">
            <LeaseTenantActions
              leaseId={lease.id}
              platformFeeMGA={lease.platformFeeMGA}
            />
          </div>
        </section>
      ) : null}

      {/* Owner waiting state + cancel option */}
      {isOwner && lease.status === 'PENDING_TENANT' ? (
        <section
          className="mt-12 rounded-2xl border border-border bg-muted/30 p-7 lg:p-9"
          aria-labelledby="lease-owner-waiting-heading"
        >
          <span
            id="lease-owner-waiting-heading"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/55"
          >
            {t('lease.detail.pendingAction')}
          </span>
          <p className="mt-2 max-w-[560px] text-[15px] leading-[1.55] text-foreground/75">
            {t('lease.owner.waiting', {
              name: lease.tenant.name ?? lease.tenant.email,
            })}
          </p>
          <div className="mt-6 border-t border-border pt-6">
            <LeaseOwnerCancel leaseId={lease.id} />
          </div>
        </section>
      ) : null}

      {/* ACTIVE — soft confirmation block, no action needed */}
      {lease.status === 'ACTIVE' ? (
        <section
          className="mt-12 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-7 lg:p-9"
          aria-labelledby="lease-active-heading"
        >
          <span
            id="lease-active-heading"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700"
          >
            {t('lease.status.ACTIVE')}
          </span>
          <p className="mt-2 max-w-[560px] text-[15px] leading-[1.55] text-emerald-900">
            {t('lease.detail.statusNext.ACTIVE')}
          </p>
          <Link
            href={isOwner ? '/dashboard/listings' : '/annonces'}
            className={`${buttonVariants({ variant: 'outline', size: 'default' })} mt-6 border-emerald-300 text-emerald-800 hover:bg-emerald-100/50`}
          >
            {isOwner
              ? t('lease.detail.active.cta.owner')
              : t('lease.detail.active.cta.tenant')}
          </Link>
        </section>
      ) : null}

      {/* REFUSED — neutral exit + path forward */}
      {lease.status === 'REFUSED' ? (
        <section
          className="mt-12 rounded-2xl border border-border bg-muted/30 p-7 lg:p-9"
          aria-labelledby="lease-refused-heading"
        >
          <span
            id="lease-refused-heading"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/55"
          >
            {t('lease.status.REFUSED')}
          </span>
          <p className="mt-2 max-w-[560px] text-[15px] leading-[1.55] text-foreground/75">
            {isOwner
              ? t('lease.detail.statusNext.REFUSED.owner')
              : t('lease.detail.statusNext.REFUSED.tenant')}
          </p>
          <Link
            href={isOwner ? '/dashboard/listings' : '/annonces'}
            className={`${buttonVariants({ variant: 'outline', size: 'default' })} mt-6`}
          >
            {isOwner
              ? t('lease.detail.refused.cta.owner')
              : t('lease.detail.refused.cta.tenant')}
          </Link>
        </section>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Local sub-components — co-located because they have no reuse value */
/* outside this page.                                                 */
/* ------------------------------------------------------------------ */

function FinancialRow({
  label,
  value,
  sublabel,
  highlight = false,
}: {
  label: string
  value: string
  sublabel?: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <div>
        <dt
          className={`${highlight ? 'text-[14px] font-semibold text-foreground' : 'text-[14px] text-foreground/70'}`}
        >
          {label}
        </dt>
        {sublabel ? (
          <p className="mt-1 max-w-[420px] text-[12px] leading-[1.5] text-foreground/55">
            {sublabel}
          </p>
        ) : null}
      </div>
      <dd
        className={`font-mono tabular-nums ${
          highlight
            ? 'text-[clamp(20px,2vw,24px)] font-bold text-primary'
            : 'text-[16px] font-semibold text-foreground'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

function PartyCard({
  roleLabel,
  name,
  email,
  signedOnLabel,
  pendingLabel,
  isYou,
  youLabel,
}: {
  roleLabel: string
  name: string
  email: string
  signedOnLabel: string | null
  pendingLabel: string | null
  isYou: boolean
  youLabel: string
}) {
  return (
    <article
      className={`flex flex-col gap-3 rounded-2xl border p-5 ${
        isYou
          ? 'border-primary/30 bg-primary/[0.03]'
          : 'border-border bg-background'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
          {roleLabel}
        </span>
        {isYou ? (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-primary">
            {youLabel}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <Avatar name={name} />
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-[14.5px] font-bold text-foreground">
            {name}
          </p>
          <p className="truncate text-[12.5px] text-foreground/60">{email}</p>
        </div>
      </div>
      {signedOnLabel ? (
        <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-emerald-700">
          <span aria-hidden>✓</span>
          <span>{signedOnLabel}</span>
        </p>
      ) : pendingLabel ? (
        <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-amber-700">
          <span aria-hidden>○</span>
          <span>{pendingLabel}</span>
        </p>
      ) : null}
    </article>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[13px] font-bold tracking-[0.04em] text-primary"
    >
      {initials || '·'}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(d: Date, locale: Locale): string {
  return new Date(d).toLocaleDateString(
    locale === 'mg' ? 'mg-MG' : 'fr-FR',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )
}

function statusNextText(
  t: Translator,
  status: LeaseStatus,
  isOwner: boolean,
  isTenant: boolean,
): string {
  switch (status) {
    case 'PENDING_TENANT':
      return isTenant
        ? t('lease.detail.statusNext.PENDING_TENANT.tenant')
        : t('lease.detail.statusNext.PENDING_TENANT.owner')
    case 'ACTIVE':
      return t('lease.detail.statusNext.ACTIVE')
    case 'REFUSED':
      return isOwner
        ? t('lease.detail.statusNext.REFUSED.owner')
        : t('lease.detail.statusNext.REFUSED.tenant')
    case 'TERMINATED':
      return t('lease.detail.statusNext.TERMINATED')
    case 'DISPUTED':
      return t('lease.detail.statusNext.DISPUTED')
    case 'DRAFT':
      return t('lease.detail.statusNext.DRAFT')
  }
}
