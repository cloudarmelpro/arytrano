import type { Metadata } from 'next'
import Link from 'next/link'
import { findDuplicateGroups } from '@/features/listings/services/detect-duplicate-listings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Duplicate detection — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminDuplicatesPage() {
  const groups = await findDuplicateGroups()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Duplicate listing detection
        </h1>
        <p className="text-sm text-muted-foreground">
          Deux signaux : (a) titre normalisé identique sur des annonces
          publiées par des propriétaires DIFFÉRENTS, (b) un même numéro
          de téléphone attaché à ≥ 6 annonces (à vérifier manuellement).
        </p>
      </header>

      {groups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Aucun cluster détecté à ce jour — bravo, l’inventaire est propre.
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {groups.map((g) => (
            <li key={g.key} className="rounded-lg border border-border p-4">
              <header className="flex items-baseline justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {g.reason === 'same-title'
                    ? 'Titre identique'
                    : 'Même numéro'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {g.listings.length} annonces
                </span>
              </header>
              <p className="mt-1 font-mono text-[13px] text-foreground/70">
                {g.key}
              </p>
              <ul className="mt-3 flex flex-col gap-2 divide-y divide-border">
                {g.listings.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/listings/${l.id}`}
                        className="text-foreground hover:text-primary hover:underline"
                      >
                        {l.title}
                      </Link>
                      <span className="text-[11px] text-foreground/55">
                        {l.ownerName ?? l.ownerEmail}
                      </span>
                    </div>
                    <Link
                      href={`/${l.citySlug}/${l.neighborhoodSlug}/${l.slug}`}
                      className="text-[11px] font-mono text-primary/85 hover:underline"
                    >
                      Voir public
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
