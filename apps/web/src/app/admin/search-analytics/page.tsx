import type { Metadata } from 'next'
import { listTopSearchQueries } from '@/features/search-analytics/queries/list-top-queries'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search analytics — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminSearchAnalyticsPage() {
  const [top30, zero30] = await Promise.all([
    listTopSearchQueries({ days: 30, limit: 30 }),
    listTopSearchQueries({ days: 30, limit: 30, onlyZeroResult: true }),
  ])

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Search analytics</h1>
        <p className="text-sm text-muted-foreground">
          Ce que les visiteurs tapent sur /annonces. Les requêtes à zéro
          résultat sont un signal direct pour seed du contenu.
        </p>
      </header>

      <QueryTable
        title="Top 30 requêtes (30 derniers jours)"
        rows={top30}
      />
      <QueryTable
        title="Requêtes à zéro résultat (30 derniers jours)"
        rows={zero30}
        emptyLabel="Aucune requête sans résultat — bravo, l’inventaire couvre la demande."
      />
    </div>
  )
}

function QueryTable({
  title,
  rows,
  emptyLabel,
}: {
  title: string
  rows: Array<{ q: string; count: number; avgResultCount: number }>
  emptyLabel?: string
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {emptyLabel ?? 'Pas encore de données.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/60">
              <tr>
                <th className="px-3 py-2 font-medium">Query</th>
                <th className="px-3 py-2 text-right font-medium">Occurrences</th>
                <th className="px-3 py-2 text-right font-medium">Résultats moy.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.q} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-foreground">{r.q}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground/85">
                    {r.count}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono ${
                      r.avgResultCount === 0
                        ? 'font-semibold text-destructive'
                        : 'text-foreground/70'
                    }`}
                  >
                    {r.avgResultCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
