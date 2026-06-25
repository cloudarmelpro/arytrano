import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/features/auth'
import { getListingStats } from '@/features/listings/server'
import type { ListingStats } from '@/features/listings/server'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export const metadata: Metadata = {
  title: 'Statistiques · AryTrano',
  robots: { index: false, follow: false },
}

type Params = Promise<{ id: string }>

/**
 * Per-listing owner stats page (T-046). Linked from :
 *   - The "Stats" button on each row of `/dashboard/listings`
 *   - The "Voir les stats" CTA in the contact-received email (T-047)
 *
 * Auth : double gate. The Server Action / page guard requires a
 * session, and `getListingStats` filters `WHERE ownerId = userId` —
 * so even a tampered URL with someone else's listing id returns
 * notFound() instead of leaking another owner's numbers.
 */
export default async function ListingStatsPage({
  params,
}: {
  params: Params
}) {
  const [{ id }, session, locale] = await Promise.all([
    params,
    auth(),
    getLocale(),
  ])
  if (!session?.user) redirect(`/sign-in?returnTo=/dashboard/listings/${id}/stats`)

  const stats = await getListingStats(id, session.user.id)
  if (!stats) notFound()

  const t = getT(locale)
  const dateFmt = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Conversion : reviews / contacts. Capped 100% just in case (review
  // without prior contact event from same user is allowed).
  const conversion =
    stats.totals.contacts > 0
      ? Math.min(100, Math.round((stats.totals.reviews / stats.totals.contacts) * 100))
      : null

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link
          href="/dashboard/listings"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← {t('dashboard.listingStats.back')}
        </Link>
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {t('dashboard.listingStats.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {stats.listing.title}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
          <span
            className={`inline-flex h-5 items-center rounded-full px-2 font-bold uppercase tracking-[0.08em] ${
              stats.listing.status === 'PUBLISHED'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {stats.listing.status}
          </span>
          {stats.listing.status === 'PUBLISHED' ? (
            <Link
              href={`/${stats.listing.citySlug}/${stats.listing.neighborhoodSlug}/${stats.listing.slug}`}
              className="text-[12.5px] font-medium text-primary underline-offset-2 hover:underline"
            >
              {t('dashboard.listingStats.viewPublic')} →
            </Link>
          ) : null}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* T-058 — view stats up front : "people are LOOKING" is the
            top-of-funnel signal an owner needs to retain. */}
        <ViewsCard
          views7d={stats.views.views7d}
          views30d={stats.views.views30d}
          series={stats.views.series7d}
          label={t('dashboard.listingStats.kpi.views7d')}
        />
        <StatCard
          label={t('dashboard.listingStats.kpi.contacts30d')}
          value={stats.last30Days.contacts}
          help={t('dashboard.listingStats.kpi.contacts30d.help', {
            wa: stats.last30Days.contactsByChannel.WHATSAPP,
            ph: stats.last30Days.contactsByChannel.PHONE,
          })}
        />
        <StatCard
          label={t('dashboard.listingStats.kpi.reviews')}
          value={stats.totals.reviews}
          help={
            stats.totals.reviewsAverage !== null
              ? t('dashboard.listingStats.kpi.reviews.helpRated', {
                  avg: stats.totals.reviewsAverage.toFixed(1),
                })
              : t('dashboard.listingStats.kpi.reviews.helpEmpty')
          }
        />
        <StatCard
          label={t('dashboard.listingStats.kpi.conversion')}
          value={conversion !== null ? `${conversion}%` : '—'}
          help={t('dashboard.listingStats.kpi.conversion.help')}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          {t('dashboard.listingStats.recentContacts.title')}
        </h2>
        {stats.recentContacts.length === 0 ? (
          <p className="rounded-md bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
            {t('dashboard.listingStats.recentContacts.empty')}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-md border border-border bg-card">
            {stats.recentContacts.map((c) => (
              <RecentContactRow
                key={c.id}
                contact={c}
                formatter={dateFmt}
                labels={{
                  channel: {
                    WHATSAPP: t('dashboard.listingStats.channel.whatsapp'),
                    PHONE: t('dashboard.listingStats.channel.phone'),
                  },
                  signedIn: t('dashboard.listingStats.recentContacts.signedIn'),
                  anonymous: t('dashboard.listingStats.recentContacts.anonymous'),
                }}
              />
            ))}
          </ul>
        )}
        <p className="text-[12.5px] text-muted-foreground">
          {t('dashboard.listingStats.recentContacts.privacy')}
        </p>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  help,
}: {
  label: string
  value: number | string
  help: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-muted/40 p-5">
      <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-[28px] font-semibold leading-none text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[12.5px] leading-[1.5] text-foreground/70">
        {help}
      </p>
    </div>
  )
}

/**
 * T-058 — views over 7 days with a tiny inline SVG sparkline. The
 * sparkline is pure SVG (no recharts) so it stays in the server
 * bundle and ships zero client JS for this widget.
 */
function ViewsCard({
  views7d,
  views30d,
  series,
  label,
}: {
  views7d: number
  views30d: number
  series: ListingStats['views']['series7d']
  label: string
}) {
  const W = 160
  const H = 36
  const max = Math.max(1, ...series.map((p) => p.count))
  const step = series.length > 1 ? W / (series.length - 1) : W
  const points = series.map((p, i) => {
    const x = i * step
    const y = H - (p.count / max) * H
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const pathD = `M ${points.join(' L ')}`
  const lastX = (series.length - 1) * step
  const lastY = H - ((series.at(-1)?.count ?? 0) / max) * H

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-primary/[0.06] p-5 ring-1 ring-primary/15">
      <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-primary">
        {label}
      </p>
      <div className="flex items-end justify-between gap-3">
        <p className="font-mono text-[28px] font-semibold leading-none text-foreground">
          {views7d}
        </p>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          aria-hidden
          className="text-primary"
        >
          <path
            d={`${pathD} L ${W},${H} L 0,${H} Z`}
            fill="currentColor"
            opacity={0.12}
          />
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={lastX} cy={lastY} r={2.5} fill="currentColor" />
        </svg>
      </div>
      <p className="text-[12.5px] leading-[1.5] text-foreground/70">
        {views30d} sur les 30 derniers jours
      </p>
    </div>
  )
}

function RecentContactRow({
  contact,
  formatter,
  labels,
}: {
  contact: ListingStats['recentContacts'][number]
  formatter: Intl.DateTimeFormat
  labels: {
    channel: { WHATSAPP: string; PHONE: string }
    signedIn: string
    anonymous: string
  }
}) {
  return (
    <li className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {labels.channel[contact.channel]}
        </span>
        <span className="text-[12px] text-muted-foreground">
          {contact.hasViewer ? labels.signedIn : labels.anonymous}
        </span>
      </div>
      <time
        dateTime={contact.createdAt.toISOString()}
        className="font-mono text-[12.5px] text-muted-foreground"
      >
        {formatter.format(contact.createdAt)}
      </time>
    </li>
  )
}
