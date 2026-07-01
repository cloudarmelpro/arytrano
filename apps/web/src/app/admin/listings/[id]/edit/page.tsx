import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminEditListingForm } from '@/features/admin/components/AdminEditListingForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Édition — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminEditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      priceMonthlyMGA: true,
      cautionMonths: true,
      surfaceM2: true,
      bedrooms: true,
      bathrooms: true,
      furnished: true,
      type: true,
      cityId: true,
      neighborhoodId: true,
      status: true,
    },
  })
  if (!listing || listing.status === 'DELETED') notFound()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link
          href={`/admin/listings/${listing.id}`}
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Retour
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">
          Édition administrateur — {listing.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Modification directe sans passer par le propriétaire. Toute
          modification est enregistrée dans le journal d’audit.
        </p>
      </header>

      <AdminEditListingForm
        defaults={{
          listingId: listing.id,
          title: listing.title,
          description: listing.description,
          priceMonthlyMGA: listing.priceMonthlyMGA,
          cautionMonths: listing.cautionMonths,
          surfaceM2: listing.surfaceM2,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          furnished: listing.furnished,
          type: listing.type,
          cityId: listing.cityId,
          neighborhoodId: listing.neighborhoodId,
        }}
      />
    </div>
  )
}
