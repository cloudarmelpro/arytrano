import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/features/auth'
import { listUserLeases } from '@/features/leases/queries/list-user-leases'
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { formatAriary } from '@/lib/format/currency'

export const metadata: Metadata = {
  title: 'Mes baux',
  robots: { index: false, follow: false },
}

export default async function LeasesListPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in?next=/dashboard/leases')

  const [leases, locale] = await Promise.all([
    listUserLeases(session.user.id),
    getLocale(),
  ])
  const t = getT(locale)

  return (
    <div className="mx-auto max-w-[1080px] px-6 lg:px-10">
      <header className="mb-10">
        <span aria-hidden className="block h-px w-12 bg-primary" />
        <span className="mt-5 inline-block text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          {t('lease.list.eyebrow')}
        </span>
        <h1 className="mt-3.5 text-[clamp(32px,3.8vw,52px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
          {t('lease.list.title')}
        </h1>
      </header>

      {leases.length === 0 ? (
        <EmptyState
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
          }
          title={t('lease.list.empty.title')}
          description={t('lease.list.empty.body')}
          cta={{ href: '/annonces', label: 'Explorer les annonces' }}
        />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {leases.map((lease) => {
            const role = lease.owner.id === session.user.id ? 'owner' : 'tenant'
            const counterpart = role === 'owner' ? lease.tenant : lease.owner
            return (
              <li key={lease.id}>
                <Link
                  href={`/dashboard/leases/${lease.id}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-5 py-5 transition hover:bg-muted/30"
                >
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground/55">
                        {role === 'owner'
                          ? t('lease.list.row.asOwner')
                          : t('lease.list.row.asTenant')}
                      </span>
                      <LeaseStatusBadge status={lease.status} />
                    </div>
                    <p className="mt-1.5 text-[15px] font-bold tracking-[-0.01em] text-foreground">
                      {lease.listing.title}
                    </p>
                    <p className="mt-1 text-[12.5px] text-foreground/65">
                      {role === 'owner'
                        ? t('lease.list.row.tenant', {
                            name:
                              counterpart.name ?? t('lease.list.row.asTenant'),
                          })
                        : t('lease.list.row.owner', {
                            name:
                              counterpart.name ?? t('lease.list.row.asOwner'),
                          })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-[13.5px] font-bold tabular-nums text-foreground">
                      {formatAriary(lease.monthlyRentMGA)}
                    </span>
                    <span className="text-[11px] text-foreground/55">
                      {t('lease.list.row.perMonth')}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
