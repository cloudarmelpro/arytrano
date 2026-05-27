import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNeighborhoodForAdmin } from '@/features/admin-geo'
import { EditorialForm } from '@/features/admin-geo/components/EditorialForm'
import { QuizProfileForm } from '@/features/admin-geo/components/QuizProfileForm'

export const metadata: Metadata = {
  title: 'Édition quartier · Admin AryTrano',
  robots: { index: false, follow: false },
}

type Params = Promise<{ citySlug: string; neighborhoodSlug: string }>

/**
 * E-T07 Batch C — neighborhood edit page.
 *
 * Two stacked sections :
 *  1. EditorialForm : FR/MG 6-field copy (tagline, ambiance, …).
 *  2. QuizProfileForm (Batch C2) : bounded inputs (0-3 scores,
 *     enum radios, multi-select checkboxes) for the ranking config.
 *     Server still re-Zod-parses — the UI just makes invalid values
 *     unreachable in the first place.
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

      <section className="flex flex-col gap-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-semibold text-foreground">
            Profil quiz
          </h2>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Configuration du scoring Q0 → recommandations. Sans profil,
            ce quartier ne remontera pas dans le quiz.
          </p>
        </div>
        <QuizProfileForm
          citySlug={detail.citySlug}
          neighborhoodSlug={detail.slug}
          initialProfile={detail.quizProfile}
        />
      </section>
    </div>
  )
}
