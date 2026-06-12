'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import { getLeaseContractPdfUrlAction } from '../actions/get-lease-contract-pdf-url'

/**
 * E-T27.1 — download button on /dashboard/leases/[id].
 *
 * Click → Server Action re-signs the Cloudinary URL → opens it in
 * a new tab. The signed URL expires after 7 days but we generate
 * fresh ones on every click so paste-the-link sharing goes stale.
 */
export function DownloadLeasePdfButton({
  leaseId,
  isAvailable,
}: {
  leaseId: string
  /** false when contractPdfPublicId is null (still generating). */
  isAvailable: boolean
}) {
  const t = useT()
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      const result = await getLeaseContractPdfUrlAction(leaseId)
      if (!result.ok || !result.url) {
        toast.error(result.message ?? 'Téléchargement impossible.')
        return
      }
      window.open(result.url, '_blank', 'noopener,noreferrer')
    })
  }

  if (!isAvailable) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        {t('lease.pdf.pending')}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? t('lease.pdf.signing') : t('lease.pdf.download')}
    </Button>
  )
}
