import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/features/auth'
import { getInventoryForLease } from '@/features/inventory/server'
import { InventoryPhaseColumn } from '@/features/inventory/components/InventoryPhaseColumn'

export const metadata: Metadata = {
  title: 'État des lieux',
  robots: { index: false, follow: false },
}

export default async function InventoryWizardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: leaseId } = await params
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/sign-in?next=/dashboard/leases/${leaseId}/inventory`)
  }

  const data = await getInventoryForLease(leaseId)
  if (!data) notFound()

  const isParty =
    data.ownerId === session.user.id || data.tenantId === session.user.id
  if (!isParty && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Phase locks driven by Lease status :
  //  ENTRY allowed only while ACTIVE — once TERMINATED, locked as
  //  dispute evidence (per service).
  //  EXIT allowed in ACTIVE (anticipated co-fill) + TERMINATED.
  const entryDisabled = data.leaseStatus !== 'ACTIVE'
  const exitDisabled =
    !['ACTIVE', 'TERMINATED', 'DISPUTED'].includes(data.leaseStatus)

  return (
    <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
      <Link
        href={`/dashboard/leases/${leaseId}`}
        className="mb-3 inline-block text-[12.5px] text-foreground/60 hover:text-primary"
      >
        ← Retour au bail
      </Link>

      <header className="mb-8">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          E-T27.2 · État des lieux
        </span>
        <h1 className="mt-3 font-serif text-[clamp(28px,3.4vw,40px)] font-normal leading-[1.1] tracking-[-0.025em] text-foreground">
          {data.listingTitle}
        </h1>
        <p className="mt-3 max-w-[640px] text-[14.5px] leading-[1.55] text-foreground/65">
          Photographiez chaque pièce avec le bailleur ou le locataire. L’état
          des lieux d’entrée doit être complété au moment de la remise des
          clés. Celui de sortie déclenche la restitution de la caution. En
          cas de litige (E-T27.3), les deux états sont comparés côte à côte.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <InventoryPhaseColumn
          leaseId={leaseId}
          phase="ENTRY"
          title="État d’entrée"
          items={data.entry}
          disabled={entryDisabled}
        />
        <InventoryPhaseColumn
          leaseId={leaseId}
          phase="EXIT"
          title="État de sortie"
          items={data.exit}
          disabled={exitDisabled}
        />
      </div>

      <p className="mt-10 text-[11.5px] text-foreground/50">
        Les photos sont stockées sur Cloudinary (EXIF retiré au moment de
        l’upload). Tu peux supprimer ou remplacer une photo à tout moment
        tant que le bail n’est pas terminé.
      </p>
    </div>
  )
}
