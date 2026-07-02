import type { Metadata } from 'next'
import Link from 'next/link'
import { detectInactiveOwners } from '@/features/owner-anomaly/services/detect-inactive-owners'
import { fmtShortDate } from '@/lib/format/date'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Owners inactifs — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminInactiveOwnersPage() {
  const rows = await detectInactiveOwners()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Propriétaires sans contact — 30 jours
        </h1>
        <p className="text-sm text-muted-foreground">
          Comptes actifs avec au moins une annonce PUBLIÉE mais zéro
          ContactEvent depuis 30 jours. Envisage un email de relance ou
          une suggestion de refresh photo / prix.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Personne d’inactif — tout le monde reçoit du trafic.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/60">
              <tr>
                <th className="px-3 py-2 font-medium">Propriétaire</th>
                <th className="px-3 py-2 font-medium">Annonces publiées</th>
                <th className="px-3 py-2 font-medium">Publié depuis</th>
                <th className="px-3 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ownerId} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="text-foreground">{r.name ?? '—'}</div>
                    <div className="text-[11px] text-foreground/55">{r.email}</div>
                  </td>
                  <td className="px-3 py-2 font-mono">{r.listingCount}</td>
                  <td className="px-3 py-2 font-mono text-foreground/70">
                    {r.publishedSince ? fmtShortDate(r.publishedSince) : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/users/${r.ownerId}`}
                      className="text-primary hover:underline"
                    >
                      Voir profil
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
