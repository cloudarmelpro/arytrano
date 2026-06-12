'use server'

import { auth } from '@/features/auth'
import { prisma } from '@/lib/db'
import { signLeasePdfUrl } from '@/lib/cloudinary/upload-pdf'

export type GetLeasePdfUrlActionState = {
  ok: boolean
  url?: string
  message?: string
}

/**
 * E-T27.1 — re-sign the lease PDF download URL on demand.
 *
 * Why a Server Action and not a static link : the Cloudinary URL is
 * private, only signed URLs work. Signed URLs expire after 7 days ;
 * we re-sign on every download click so a leaked URL goes stale
 * fast. Caller (the dashboard download button) opens
 * `window.open(url)` after the action returns.
 *
 * Authorization : tenant OR owner OR ADMIN can fetch. Anyone else
 * (random visitor with the lease id) gets `forbidden`.
 */
export async function getLeaseContractPdfUrlAction(
  leaseId: string,
): Promise<GetLeasePdfUrlActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise.' }
  }

  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      ownerId: true,
      tenantId: true,
      contractPdfPublicId: true,
      contractPdfUrl: true,
    },
  })
  if (!lease) {
    return { ok: false, message: 'Bail introuvable.' }
  }

  const isParty =
    lease.ownerId === session.user.id || lease.tenantId === session.user.id
  const isAdmin = session.user.role === 'ADMIN'
  if (!isParty && !isAdmin) {
    return { ok: false, message: 'Accès refusé.' }
  }

  if (!lease.contractPdfPublicId) {
    return {
      ok: false,
      message:
        'Le contrat PDF n’est pas encore disponible. Re-essaie dans quelques minutes.',
    }
  }

  const url = signLeasePdfUrl(lease.contractPdfPublicId)
  return { ok: true, url }
}
