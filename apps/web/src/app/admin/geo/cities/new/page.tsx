import type { Metadata } from 'next'
import Link from 'next/link'
import { CreateCityForm } from '@/features/admin-geo/components/CreateCityForm'

export const metadata: Metadata = {
  title: 'Nouvelle ville · Admin AryTrano',
  robots: { index: false, follow: false },
}

export default function NewCityPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <nav className="text-[12px] font-medium text-muted-foreground">
          <Link href="/admin/geo" className="hover:text-foreground">
            Géographie
          </Link>{' '}
          › <span className="text-foreground">Nouvelle ville</span>
        </nav>
        <h1 className="text-3xl font-semibold leading-tight text-foreground">
          Nouvelle ville
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Crée une ville (slug, noms FR/MG, coordonnées). L&apos;éditorial
          des quartiers se renseigne ensuite via la page d&apos;édition.
        </p>
      </header>
      <CreateCityForm />
    </div>
  )
}
