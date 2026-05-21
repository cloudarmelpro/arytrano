import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/features/auth'
import {
  ListingStatusBadge,
  ListingActionsMenu,
} from '@/features/listings'
import { listOwnerListings } from '@/features/listings/server'
import { formatAriary } from '@/lib/format/currency'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT, type Translator } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('dashboard.listings.title') }
}

export default async function MyListingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')
  if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [listings, locale] = await Promise.all([
    listOwnerListings(session.user.id),
    getLocale(),
  ])
  const t = getT(locale)
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {t('dashboard.listings.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(
              listings.length <= 1
                ? 'dashboard.listings.count.one'
                : 'dashboard.listings.count.other',
              { count: listings.length },
            )}{' '}
            {t('dashboard.listings.leadSuffix')}
          </p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t('dashboard.listings.newListing')}
        </Link>
      </header>

      {listings.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((l) => (
            <li key={l.id} className="group flex flex-col">
              <Link
                href={`/dashboard/listings/${l.id}/edit`}
                className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {l.thumbnailUrl ? (
                  <Image
                    src={l.thumbnailUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    {t('dashboard.listings.noThumbnail')}
                  </div>
                )}

                <div className="absolute left-3 top-3">
                  <ListingStatusBadge status={l.status} />
                </div>

                {l.openReportCount > 0 && (
                  <span
                    aria-label={t(
                      l.openReportCount <= 1
                        ? 'dashboard.listings.reportBadge.one'
                        : 'dashboard.listings.reportBadge.other',
                      { count: l.openReportCount },
                    )}
                    className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground shadow-sm"
                  >
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-destructive-foreground" />
                    {l.openReportCount}
                  </span>
                )}
              </Link>

              <div className="mt-3 flex flex-col gap-1 px-0.5">
                <p className="text-xs text-muted-foreground">
                  {t(`listing.type.${l.type}` as const)}
                  <span className="mx-1">·</span>
                  {l.neighborhood.nameFr}
                </p>
                <Link
                  href={`/dashboard/listings/${l.id}/edit`}
                  className="line-clamp-1 text-[15px] font-medium text-foreground transition hover:text-primary"
                >
                  {l.title}
                </Link>
                <p className="mt-1 text-[15px]">
                  <span className="font-mono font-semibold text-foreground">
                    {formatAriary(l.priceMonthlyMGA)}
                  </span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    {t('dashboard.listings.perMonth')}
                  </span>
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <IconMessage />
                    {t(
                      l.contactCount <= 1
                        ? 'dashboard.listings.contactCount.one'
                        : 'dashboard.listings.contactCount.other',
                      { count: l.contactCount },
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconImage />
                    {t(
                      l.photoCount <= 1
                        ? 'dashboard.listings.photoCount.one'
                        : 'dashboard.listings.photoCount.other',
                      { count: l.photoCount },
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconCalendar />
                    {l.publishedAt
                      ? t('dashboard.listings.publishedOn', {
                          date: dateFormatter.format(l.publishedAt),
                        })
                      : t('dashboard.listings.createdOn', {
                          date: dateFormatter.format(l.createdAt),
                        })}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <Link
                    href={`/dashboard/listings/${l.id}/edit`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary/80"
                  >
                    <IconEdit />
                    {t('dashboard.listings.edit')}
                  </Link>
                  <ListingActionsMenu listingId={l.id} status={l.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function IconMessage() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconImage() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function EmptyState({ t }: { t: Translator }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-medium text-foreground">
          {t('dashboard.listings.empty.title')}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t('dashboard.listings.empty.lead')}
        </p>
      </div>
      <Link
        href="/dashboard/listings/new"
        className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {t('dashboard.listings.create.cta')}
      </Link>
    </div>
  )
}
