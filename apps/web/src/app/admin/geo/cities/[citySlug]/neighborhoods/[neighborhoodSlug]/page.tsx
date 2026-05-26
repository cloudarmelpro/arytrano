import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNeighborhoodForAdmin } from '@/features/admin-geo'
import { EditorialForm } from '@/features/admin-geo/components/EditorialForm'

export const metadata: Metadata = {
  title: 'Édition quartier · Admin AryTrano',
  robots: { index: false, follow: false },
}

type Params = Promise<{ citySlug: string; neighborhoodSlug: string }>

/**
 * E-T07 Batch C — neighborhood editorial edit page.
 *
 * Renders the FR/MG side-by-side form fed by the current DB row.
 * QuizProfile edition is out of scope for this batch — the row's
 * `quizProfile` is shown read-only so the admin can see if it exists
 * but tweaks still go through the seed file (less risk of breaking
 * the ranking algorithm via a hand-typed number).
 */
export default async function AdminNeighborhoodEditPage({
  params,
}: {
  params: Params
}) {
  const { citySlug, neighborhoodSlug } = await params
  const detail = await getNeighborhoodForAdmin(citySlug, neighborhoodSlug)
  if (!detail) notFound()

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <nav className="text-[12px] font-medium text-muted-foreground">
          <Link href="/admin/geo" className="hover:text-foreground">
            Géographie
          </Link>{' '}
          ›{' '}
          <span className="text-foreground">{detail.cityNameFr}</span>{' '}
          ›{' '}
          <span className="text-foreground">{detail.nameFr}</span>
        </nav>
        <h1 className="text-3xl font-semibold leading-tight text-foreground">
          {detail.nameFr}
        </h1>
        <p className="text-sm text-muted-foreground">
          {detail.cityNameFr} · {detail.publishedListingsCount}{' '}
          {detail.publishedListingsCount === 1
            ? 'annonce publiée'
            : 'annonces publiées'}
        </p>
      </header>

      <EditorialForm
        citySlug={detail.citySlug}
        neighborhoodSlug={detail.slug}
        initialEditorial={detail.editorial}
      />

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-5">
        <h2 className="text-base font-semibold text-foreground">
          Profil quiz
        </h2>
        {detail.quizProfile ? (
          <>
            <p className="text-[13px] text-muted-foreground">
              Profil scoring du quiz pour ce quartier — édition non
              exposée ici (Batch C2). Modifier via le seed
              <code className="ml-1 rounded bg-background px-1 py-0.5 text-[11.5px]">
                src/features/quiz/data/quartier-profiles.ts
              </code>
              puis re-seed.
            </p>
            <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-[12px]">
              {JSON.stringify(detail.quizProfile, null, 2)}
            </pre>
          </>
        ) : (
          <p className="text-[13px] text-amber-700">
            Pas de profil quiz pour ce quartier — il n&apos;apparaîtra
            pas dans les recommandations du Q0.
          </p>
        )}
      </section>
    </div>
  )
}
