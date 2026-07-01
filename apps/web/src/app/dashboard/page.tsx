import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/features/auth'
import { countOwnerListings } from '@/features/listings/server'
import { countUserPublishedFavorites } from '@/features/favorites/server'
import { computeOwnerWeeklyDigest } from '@/features/owner-digest/queries/compute-owner-weekly-digest'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT, type Translator } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('sidebar.myAccount') }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')
  const user = session.user
  const locale = await getLocale()
  const t = getT(locale)
  const firstName = user.name?.split(' ')[0] ?? ''
  const isOwner = user.role === 'OWNER' || user.role === 'ADMIN'

  // Lightweight stats — only the counts the user cares about on their
  // landing page. Skip owner-only queries for students.
  // OWN-13 — owners also get the 7d weekly snapshot (contacts / favorites
  // / views + top 3 listings) reused from the OWN-04 digest query.
  const [ownerCounts, favoritesCount, ownerDigest] = await Promise.all([
    isOwner
      ? countOwnerListings(user.id)
      : Promise.resolve({ total: 0, published: 0 }),
    countUserPublishedFavorites(user.id),
    isOwner ? computeOwnerWeeklyDigest(user.id) : Promise.resolve(null),
  ])
  const listingsCount = ownerCounts.total
  const publishedCount = ownerCounts.published

  return (
    <div className="flex flex-col gap-10">
      {/* Welcome hero */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {firstName
            ? t('dashboard.welcome.title', { name: firstName }).trim()
            : t('dashboard.welcome.titleNoName')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t(`dashboard.welcome.account.${user.role}` as const)}
        </p>
      </header>

      {/* Stats — only meaningful counters for the current role */}
      <section className="grid gap-3 sm:grid-cols-3">
        {isOwner && (
          <StatCard
            label={t('dashboard.stats.totalListings')}
            value={listingsCount}
            hint={t('dashboard.stats.publishedHint', { count: publishedCount })}
            icon={<IconList />}
          />
        )}
        <StatCard
          label={t('dashboard.stats.favorites')}
          value={favoritesCount}
          hint={t('dashboard.stats.favoritesHint')}
          icon={<IconHeart />}
        />
        {!isOwner && (
          <StatCard
            label={t('dashboard.stats.welcomeRole')}
            value={t(`dashboard.welcome.account.${user.role}` as const)}
            hint=""
            icon={<IconUser />}
            stringValue
          />
        )}
      </section>

      {/* OWN-13 — 7-day portfolio KPI band + top 3 listings for owners.
          Sits above quick-actions so the first thing an owner sees on
          login is "did we get contacts this week ?". */}
      {isOwner && ownerDigest && (
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-background p-5">
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">
              Ta semaine — 7 derniers jours
            </h2>
            <span className="text-[11px] uppercase tracking-wide text-foreground/55">
              Mis à jour à l’instant
            </span>
          </header>
          <div className="grid gap-3 sm:grid-cols-4">
            <MiniKpi label="Contacts" value={ownerDigest.totals.contacts7d} />
            <MiniKpi label="Favoris" value={ownerDigest.totals.favorites7d} />
            <MiniKpi label="Vues" value={ownerDigest.totals.views7d} />
            <MiniKpi
              label="Expirent < 10 j"
              value={ownerDigest.totals.expiringSoon}
              warn={ownerDigest.totals.expiringSoon > 0}
            />
          </div>
          {ownerDigest.topListings.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/55">
                Top annonces
              </p>
              <ul className="flex flex-col divide-y divide-border">
                {ownerDigest.topListings.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <Link
                      href={`/${l.citySlug}/${l.neighborhoodSlug}/${l.slug}`}
                      className="truncate text-foreground hover:text-primary hover:underline"
                    >
                      {l.title}
                    </Link>
                    <span className="shrink-0 font-mono text-[12px] text-foreground/70">
                      {l.contacts7d} contact{l.contacts7d === 1 ? '' : 's'} · {l.views7d} vues
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Quick actions */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">
          {t('dashboard.quickActions.title')}
        </h2>
        <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {isOwner && (
            <ActionCard
              href="/dashboard/listings"
              title={t('dashboard.nav.listings.title')}
              lead={t('dashboard.nav.listings.lead')}
              icon={<IconList />}
              t={t}
            />
          )}
          <ActionCard
            href="/dashboard/favoris"
            title={t('dashboard.nav.favorites.title')}
            lead={t('dashboard.nav.favorites.lead')}
            icon={<IconHeart />}
            t={t}
          />
          <ActionCard
            href="/dashboard/profile"
            title={t('dashboard.nav.profile.title')}
            lead={t('dashboard.nav.profile.lead')}
            icon={<IconUser />}
            t={t}
          />
          <ActionCard
            href="/dashboard/settings"
            title={t('dashboard.nav.settings.title')}
            lead={t('dashboard.nav.settings.lead')}
            icon={<IconShield />}
            t={t}
          />
        </nav>
      </section>
    </div>
  )
}

/* ============================================================
 *  Small layout helpers — local to the dashboard overview.
 *  Keeping them in-file (instead of a separate component) so the
 *  page reads top-to-bottom without hopping between files.
 * ============================================================ */

function MiniKpi({
  label,
  value,
  warn = false,
}: {
  label: string
  value: number
  warn?: boolean
}) {
  return (
    <div
      className={`flex flex-col rounded-lg border p-3 ${
        warn
          ? 'border-amber-300 bg-amber-50 text-amber-900'
          : 'border-border bg-muted/30 text-foreground'
      }`}
    >
      <span className="text-[10.5px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </span>
      <span className="mt-0.5 font-mono text-2xl font-semibold">{value}</span>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon,
  stringValue = false,
}: {
  label: string
  value: number | string
  hint: string
  icon: React.ReactNode
  stringValue?: boolean
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p
        className={
          stringValue
            ? 'text-base font-semibold text-foreground'
            : 'font-mono text-3xl font-semibold text-foreground'
        }
      >
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function ActionCard({
  href,
  title,
  lead,
  icon,
  t,
}: {
  href: string
  title: string
  lead: string
  icon: React.ReactNode
  t: Translator
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl bg-muted/40 p-5 transition hover:bg-primary/5"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">{lead}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
        {t('dashboard.quickActions.go')} →
      </span>
    </Link>
  )
}

/* ---------- icons ---------- */

function IconList() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function IconHeart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  )
}
