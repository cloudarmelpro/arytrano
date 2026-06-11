'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { claimLeadAction } from '../actions/claim-lead'

/**
 * E-T28 T-RES-06 — claim button. Server-enforced WIP cap = 6 lives in
 * the service ; this client only surfaces the toast on error.
 */
export function ClaimLeadButton({ leadId }: { leadId: string }) {
  const [pending, startTransition] = useTransition()
  function onClick() {
    startTransition(async () => {
      const result = await claimLeadAction(leadId)
      if (!result.ok) {
        toast.error(result.message ?? 'Erreur')
      } else {
        toast.success('Lead claimé.')
      }
    })
  }
  return (
    <Button
      type="button"
      size="sm"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? 'Claim…' : 'Je claim'}
    </Button>
  )
}
