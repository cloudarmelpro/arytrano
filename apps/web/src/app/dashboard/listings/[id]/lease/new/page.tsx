import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { auth } from '@/features/auth'
import { getListingForLeaseWizard } from '@/features/listings/queries/get-listing-for-lease-wizard'
import { LeaseWizard } from '@/features/leases/components/LeaseWizard'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export const metadata: Metadata = {
  title: 'Nouveau bail',
  robots: { index: false, follow: false },
}

export default async function NewLeasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: listingId } = await params
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/sign-in?next=/dashboard/listings/${listingId}/lease/new`)
  }

  // PERF-M1 + arch fix — query lives in features/listings/queries/, not inline here.
  const [listing, locale] = await Promise.all([
    getListingForLeaseWizard(listingId),
    getLocale(),
  ])
  if (!listing) notFound()
  if (listing.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
    notFound()
  }

  const t = getT(locale)

  return (
    <div className="mx-auto max-w-[760px] px-6 py-12 lg:px-10 lg:py-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-[12px] font-medium text-muted-foreground"
      >
        <Link href="/dashboard" className="transition hover:text-foreground">
          {t('common.appName')}
        </Link>
        <span aria-hidden>›</span>
        <Link
          href={`/dashboard/listings`}
          className="transition hover:text-foreground"
        >
          {t('dashboard.listings.title' as const)}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-foreground">{listing.title}</span>
      </nav>
      <header className="mb-10">
        <span
          aria-hidden
          className="block h-px w-12 bg-primary"
        />
        <span className="mt-5 inline-block text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          {t('lease.wizard.eyebrow')}
        </span>
        <h1 className="mt-3.5 font-serif text-[clamp(32px,3.8vw,52px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
          {t('lease.wizard.title')}
        </h1>
        <p className="mt-4 max-w-[540px] text-[16px] leading-[1.6] text-foreground/65">
          {t('lease.wizard.lead', { listing: listing.title })}
        </p>
      </header>
      <LeaseWizard
        listingId={listing.id}
        listingTitle={listing.title}
        monthlyRentMGA={listing.priceMonthlyMGA}
        cautionMonths={listing.cautionMonths}
      />
    </div>
  )
}
