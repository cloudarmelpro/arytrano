import type { Metadata } from 'next'
import Link from 'next/link'
import { listGeoAdmin } from '@/features/admin-geo'

export const metadata: Metadata = {
  title: 'Géographie · Admin AryTrano',
  robots: { index: false, follow: false },
}

/**
 * E-T07 Batch C — admin geo overview.
 *
 * Lists every City + its Neighborhoods with coverage indicators
 * (editorial, quizProfile, listings count). Helps the admin spot
 * rows that still need editorial work — the 4 new cities arrived in
 * the database with quizProfile populated but `editorial` null, so
 * those rows surface as "À éditer" here.
 *
 * Edit happens on the detail page (`./cities/[slug]/neighborhoods/[slug]`).
 * Create / delete of City + Neighborhood rows is intentionally NOT
 * exposed in Batch C — adding a brand-new city is still rare enough
 * to warrant a seed-file change + code review.
 */
export default async function AdminGeoPage() {
  const cities = await listGeoAdmin()
  const totalNeighborhoods = cities.reduce(
    (n, c) => n + c.neighborhoods.length,
    0,
  )
  const editorialMissing = cities.reduce(
    (n, c) => n + c.neighborhoods.filter((q) => !q.hasEditorial).length,
    0,
  )

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          Géographie
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Édite le contenu éditorial des quartiers — tagline, ambiance,
          repères piétons, transports. Les profils de quiz et la création
          de nouvelles villes restent gérés via le seed (E-T07 Batch A).
        </p>
        <p className="mt-2 text-[13px] font-medium text-foreground/70">
          {cities.length} ville{cities.length > 1 ? 's' : ''} ·{' '}
          {totalNeighborhoods} quartiers ·{' '}
          {editorialMissing > 0 ? (
            <span className="text-amber-700">
              {editorialMissing} sans éditorial
            </span>
          ) : (
            <span className="text-emerald-700">éditorial complet</span>
          )}
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {cities.map((city) => (
          <section
            key={city.id}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold text-foreground">
                {city.nameFr}
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                /{city.slug}
              </span>
            </div>
            {city.neighborhoods.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun quartier seedé pour cette ville.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-2.5">
                        Quartier
                      </th>
                      <th scope="col" className="px-4 py-2.5">
                        Éditorial
                      </th>
                      <th scope="col" className="px-4 py-2.5">
                        Quiz profile
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-right">
                        Annonces
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {city.neighborhoods.map((n) => (
                      <tr key={n.id}>
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-foreground">
                            {n.nameFr}
                          </p>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            /{n.slug}
                          </p>
                        </td>
                        <td className="px-4 py-2.5">
                          <CoverageBadge present={n.hasEditorial} />
                        </td>
                        <td className="px-4 py-2.5">
                          <CoverageBadge present={n.hasQuizProfile} />
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                          {n.publishedListingsCount}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Link
                            href={`/admin/geo/cities/${city.slug}/neighborhoods/${n.slug}`}
                            className="text-[13px] font-semibold text-primary underline-offset-4 hover:underline"
                          >
                            Éditer
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

function CoverageBadge({ present }: { present: boolean }) {
  return present ? (
    <span className="inline-flex h-6 items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
      OK
    </span>
  ) : (
    <span className="inline-flex h-6 items-center rounded-md border border-amber-200 bg-amber-50 px-2 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
      À éditer
    </span>
  )
}
