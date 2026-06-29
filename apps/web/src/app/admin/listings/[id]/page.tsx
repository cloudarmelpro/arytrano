import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/features/auth'
import { prisma } from '@/lib/db'
import { listAdminNotes } from '@/features/admin-notes/server'
import { AdminNotesPanel } from '@/features/admin-notes/components/AdminNotesPanel'
import { formatAriary } from '@/lib/format/currency'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Annonce — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id // gated by /admin layout

  const [listing, notes] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        type: true,
        priceMonthlyMGA: true,
        publishedAt: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
        city: { select: { slug: true, nameFr: true } },
        neighborhood: { select: { slug: true, nameFr: true } },
      },
    }),
    listAdminNotes('Listing', id),
  ])
  if (!listing) notFound()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link
          href="/admin/listings"
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Toutes les annonces
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">{listing.title}</h1>
        <p className="text-sm text-muted-foreground">
          {listing.city.nameFr} · {listing.neighborhood.nameFr} · {listing.type}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-foreground/55">Statut</dt>
          <dd className="font-mono">{listing.status}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-foreground/55">Prix / mois</dt>
          <dd className="font-mono">{formatAriary(listing.priceMonthlyMGA)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-foreground/55">Propriétaire</dt>
          <dd>
            <Link
              href={`/admin/users/${listing.owner.id}`}
              className="text-primary hover:underline"
            >
              {listing.owner.name ?? listing.owner.email}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-foreground/55">Publié</dt>
          <dd className="font-mono text-foreground/70">
            {listing.publishedAt
              ? new Intl.DateTimeFormat('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit',
                }).format(listing.publishedAt)
              : '—'}
          </dd>
        </div>
      </dl>

      <AdminNotesPanel
        targetType="Listing"
        targetId={listing.id}
        notes={notes.map((n) => ({
          id: n.id,
          body: n.body,
          createdAt: n.createdAt.toISOString(),
          author: n.author,
        }))}
        currentUserId={userId}
        revalidatePath={`/admin/listings/${listing.id}`}
      />
    </div>
  )
}
