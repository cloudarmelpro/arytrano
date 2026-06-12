'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { auth } from '@/features/auth'
import { openDisputeSchema } from '../schemas'
import { openDispute } from '../services/open-dispute'

export type OpenDisputeActionState = {
  ok: boolean
  message?: string
  disputeId?: string
  fields?: Record<string, string[]>
}

export async function openDisputeAction(
  _prev: OpenDisputeActionState,
  formData: FormData,
): Promise<OpenDisputeActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise.' }
  }

  let input
  try {
    input = openDisputeSchema.parse({
      leaseId: formData.get('leaseId'),
      initialClaim: formData.get('initialClaim'),
      amountAtStakeMGA: formData.get('amountAtStakeMGA'),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      const fields: Record<string, string[]> = {}
      for (const issue of err.issues) {
        const key = issue.path[0]?.toString() ?? '_form'
        fields[key] ??= []
        fields[key]?.push(issue.message)
      }
      return { ok: false, message: 'Champs invalides.', fields }
    }
    throw err
  }

  const outcome = await openDispute(input, session.user.id)
  switch (outcome.kind) {
    case 'ok':
      revalidatePath(`/dashboard/leases/${input.leaseId}`)
      revalidatePath('/admin/disputes')
      return { ok: true, disputeId: outcome.disputeId }
    case 'lease_not_found':
      return { ok: false, message: 'Bail introuvable.' }
    case 'not_a_party':
      return { ok: false, message: 'Accès refusé.' }
    case 'wrong_lease_status':
      return {
        ok: false,
        message: `Le bail est en ${outcome.currentStatus} — pas de litige possible.`,
      }
    case 'already_open':
      return {
        ok: false,
        message: 'Un litige est déjà en cours sur ce bail.',
      }
  }
}
