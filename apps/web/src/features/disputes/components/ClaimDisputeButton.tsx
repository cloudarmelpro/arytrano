'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { claimDisputeAction } from '../actions/claim-and-resolve'

export function ClaimDisputeButton({ disputeId }: { disputeId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      type="button"
      size="sm"
      onClick={() => {
        startTransition(async () => {
          const result = await claimDisputeAction(disputeId)
          if (!result.ok) toast.error(result.message ?? 'Erreur')
          else toast.success('Litige en revue.')
        })
      }}
      disabled={pending}
    >
      {pending ? 'Claim…' : 'Je prends en charge'}
    </Button>
  )
}
