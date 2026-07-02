import type { Metadata } from 'next'
import Link from 'next/link'
import { findTyposquatCandidates } from '@/features/listings/services/detect-slug-typosquatting'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Typosquats — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminTyposquatsPage() {
  const rows = await findTyposquatCandidates()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Alertes typosquatting
        </h1>
        <p className="text-sm text-muted-foreground">
          Slugs à ≤ 2 modifications d’une annonce plus ancienne, propriétaire
          différent. Souvent un compte trying to piggyback sur une annonce
          établie.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Aucun candidat détecté.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/60">
              <tr>
                <th className="px-3 py-2 font-medium">Distance</th>
                <th className="px-3 py-2 font-medium">Annonce originale</th>
                <th className="px-3 py-2 font-medium">Annonce suspecte</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.originalId}-${r.suspiciousId}`} className="border-t border-border align-top">
                  <td className="px-3 py-2 font-mono font-semibold text-foreground">
                    {r.distance}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-foreground">{r.originalTitle}</div>
                    <div className="font-mono text-[11px] text-foreground/55">{r.originalSlug}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-destructive">{r.suspiciousTitle}</div>
                    <div className="font-mono text-[11px] text-destructive/70">{r.suspiciousSlug}</div>
                    <div className="text-[11px] text-foreground/55">{r.suspiciousOwnerEmail}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1 text-[12px]">
                      <Link
                        href={`/admin/listings/${r.originalId}`}
                        className="text-primary hover:underline"
                      >
                        Voir original
                      </Link>
                      <Link
                        href={`/admin/listings/${r.suspiciousId}`}
                        className="text-primary hover:underline"
                      >
                        Voir suspect
                      </Link>
                    </div>
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
