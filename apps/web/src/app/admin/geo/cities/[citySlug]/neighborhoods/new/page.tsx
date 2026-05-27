import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { CreateNeighborhoodForm } from '@/features/admin-geo/components/CreateNeighborhoodForm'

export const metadata: Metadata = {
  title: 'Nouveau quartier · Admin AryTrano',
  robots: { index: false, follow: false },
}

type Params = Promise<{ citySlug: string }>

export default async function NewNeighborhoodPage({
  params,
}: {
  params: Params
}) {
  const { citySlug } = await params
  // Verify the parent city exists so the form doesn't post into a
  // dead route. Cheap one-row lookup.
  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
    select: { slug: true, nameFr: true },
  })
  if (!city) notFound()

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <nav className="text-[12px] font-medium text-muted-foreground">
          <Link href="/admin/geo" className="hover:text-foreground">
            Géographie
          </Link>{' '}
          › <span className="text-foreground">{city.nameFr}</span> ›{' '}
          <span className="text-foreground">Nouveau quartier</span>
        </nav>
        <h1 className="text-3xl font-semibold leading-tight text-foreground">
          Nouveau quartier
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Crée un quartier dans <strong>{city.nameFr}</strong>. Les
          coordonnées doivent pointer vers le centre du fokontany —
          l&apos;éditorial se renseigne ensuite via la page d&apos;édition.
        </p>
      </header>
      <CreateNeighborhoodForm citySlug={city.slug} cityNameFr={city.nameFr} />
    </div>
  )
}
