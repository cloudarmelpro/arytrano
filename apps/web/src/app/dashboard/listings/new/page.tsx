import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/features/auth'
import { listCitiesWithNeighborhoods } from '@/features/geo/server'
import { ListingForm } from '@/features/listings'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('dashboard.newListing.title') }
}

export default async function NewListingPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')
  if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [cities, locale] = await Promise.all([
    listCitiesWithNeighborhoods(),
    getLocale(),
  ])
  const t = getT(locale)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link href="/dashboard/listings" className="text-sm text-muted-foreground hover:text-primary">
          {t('dashboard.backToListings')}
        </Link>
        <h1 className="text-3xl font-semibold text-primary">{t('dashboard.newListing.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('dashboard.newListing.lead')}</p>
      </header>

      <ListingForm mode="create" cities={cities} />
    </div>
  )
}
