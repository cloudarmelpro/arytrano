import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getListingsForCompare } from '@/features/compare/queries/get-listings-for-compare'
import { formatAriary } from '@/lib/format/currency'
import { EmptyState } from '@/components/shared/EmptyState'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Comparer les annonces — AryTrano',
  robots: { index: false, follow: false },
}

/**
 * TEN-01 — side-by-side comparator. Reads `?ids=a,b,c` from the URL
 * (the sticky bar builds it from the localStorage store) and renders
 * up to 3 listings with a shared row of attributes. Anonymous-friendly.
 */
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const sp = await searchParams
  const rawIds = (sp.ids ?? '').split(',').filter(Boolean).slice(0, 3)
  const listings = rawIds.length > 0 ? await getListingsForCompare(rawIds) : []

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:py-14">
      <header className="flex flex-col gap-2">
        <Link
          href="/annonces"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:opacity-80"
        >
          ← Retour à /annonces
        </Link>
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          Comparateur
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          {listings.length === 0
            ? 'Ajoute jusqu’à 3 annonces au comparateur depuis /annonces pour les voir côte à côte.'
            : `Comparaison de ${listings.length} annonce${listings.length > 1 ? 's' : ''} — les champs manquants s’affichent « — ».`}
        </p>
      </header>

      {listings.length === 0 ? (
        <EmptyState
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="7" height="16" rx="1.5" />
              <rect x="14" y="4" width="7" height="16" rx="1.5" />
            </svg>
          }
          title="Aucune annonce à comparer"
          description="Depuis /annonces, clique sur l’icône de comparateur (deux barres) sur chaque annonce pour l’ajouter ici."
          cta={{ href: '/annonces', label: 'Explorer les annonces' }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-40 border-b border-border bg-muted/40 px-3 py-3 text-left text-[11px] uppercase tracking-wide text-foreground/60">
                  Champ
                </th>
                {listings.map((l) => (
                  <th
                    key={l.id}
                    className="min-w-[220px] border-b border-l border-border bg-muted/40 px-3 py-3 text-left align-top"
                  >
                    <div className="flex flex-col gap-2">
                      {l.primaryPhotoUrl && (
                        <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                          <Image
                            src={l.primaryPhotoUrl}
                            alt={l.title}
                            fill
                            sizes="220px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <Link
                        href={`/${l.citySlug}/${l.neighborhoodSlug}/${l.slug}`}
                        className="text-sm font-semibold leading-snug text-foreground hover:text-primary hover:underline"
                      >
                        {l.title}
                      </Link>
                      <p className="text-[12px] text-foreground/65">
                        {l.neighborhoodName}, {l.cityName}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              <Row label="Prix / mois" listings={listings} render={(l) => formatAriary(l.priceMonthlyMGA)} mono />
              <Row label="Type" listings={listings} render={(l) => l.type} />
              <Row label="Statut" listings={listings} render={(l) => l.status} />
              <Row label="Surface" listings={listings} render={(l) => (l.surfaceM2 ? `${l.surfaceM2} m²` : '—')} />
              <Row label="Chambres" listings={listings} render={(l) => l.bedrooms ?? '—'} />
              <Row label="Sanitaires" listings={listings} render={(l) => l.bathrooms ?? '—'} />
              <Row label="Meublé" listings={listings} render={(l) => (l.furnished ? 'Oui' : 'Non')} />
              <Row
                label="Équipements"
                listings={listings}
                render={(l) => (l.amenities.length > 0 ? l.amenities.length + ' inclus' : '—')}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Row<T extends { id: string }>({
  label,
  listings,
  render,
  mono = false,
}: {
  label: string
  listings: T[]
  render: (l: T) => React.ReactNode
  mono?: boolean
}) {
  return (
    <tr>
      <th
        scope="row"
        className="border-t border-border bg-muted/20 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground/60"
      >
        {label}
      </th>
      {listings.map((l) => (
        <td
          key={l.id}
          className={`border-l border-t border-border px-3 py-3 align-top text-foreground/85 ${
            mono ? 'font-mono' : ''
          }`}
        >
          {render(l)}
        </td>
      ))}
    </tr>
  )
}
