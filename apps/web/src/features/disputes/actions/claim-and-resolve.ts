'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { auth } from '@/features/auth'
import {
  claimDisputeSchema,
  resolveDisputeSchema,
} from '../schemas'
import { claimDispute } from '../services/claim-dispute'
import { resolveDispute } from '../services/resolve-dispute'

export type ClaimDisputeActionState = {
  ok: boolean
  message?: string
}

export async function claimDisputeAction(
  disputeId: string,
): Promise<ClaimDisputeActionState> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { ok: false, message: 'Accès refusé.' }
  }
  try {
    claimDisputeSchema.parse({ disputeId })
  } catch {
    return { ok: false, message: 'Identifiant invalide.' }
  }
  const outcome = await claimDispute(disputeId, session.user.id)
  switch (outcome.kind) {
    case 'ok':
      revalidatePath(`/admin/disputes/${disputeId}`)
      revalidatePath('/admin/disputes')
      return { ok: true }
    case 'dispute_not_found':
      return { ok: false, message: 'Litige introuvable.' }
    case 'wrong_status':
      return {
        ok: false,
        message: `Statut ${outcome.status} — pas de claim possible.`,
      }
  }
}

export type ResolveDisputeActionState = {
  ok: boolean
  message?: string
}

export async function resolveDisputeAction(
  _prev: ResolveDisputeActionState,
  formData: FormData,
): Promise<ResolveDisputeActionState> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { ok: false, message: 'Accès refusé.' }
  }

  let input
  try {
    input = resolveDisputeSchema.parse({
      disputeId: formData.get('disputeId'),
      verdict: formData.get('verdict'),
      resolution: formData.get('resolution'),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Saisie invalide.' }
    }
    throw err
  }

  const outcome = await resolveDispute(input, session.user.id)
  switch (outcome.kind) {
    case 'ok':
      revalidatePath(`/admin/disputes/${input.disputeId}`)
      revalidatePath('/admin/disputes')
      return { ok: true }
    case 'dispute_not_found':
      return { ok: false, message: 'Litige introuvable.' }
    case 'not_reviewer':
      return {
        ok: false,
        message: 'Ce litige est claimé par un autre admin.',
      }
    case 'wrong_status':
      return { ok: false, message: `Statut ${outcome.status} non résoluble.` }
  }
}
