'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { requireAdmin } from '@/features/admin/server'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
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
  // SEC-21 — DB-fresh admin gate (was JWT session.user.role, stale).
  let userId: string
  try {
    ;({ userId } = await requireAdmin())
  } catch {
    return { ok: false, message: 'Accès refusé.' }
  }
  try {
    claimDisputeSchema.parse({ disputeId })
  } catch {
    return { ok: false, message: 'Identifiant invalide.' }
  }
  const outcome = await claimDispute(disputeId, userId)
  switch (outcome.kind) {
    case 'ok':
      void writeAuditLog({
        adminId: userId,
        action: 'dispute.claim',
        targetType: 'Dispute',
        targetId: disputeId,
      })
      revalidatePath(`/admin/disputes/${disputeId}`)
      revalidatePath('/admin/disputes')
      return { ok: true }
    case 'dispute_not_found':
      return { ok: false, message: 'Litige introuvable.' }
    case 'already_claimed':
      return {
        ok: false,
        message: 'Ce litige est déjà claimé par un autre admin.',
      }
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
  // SEC-21 — DB-fresh admin gate (was JWT session.user.role, stale).
  let userId: string
  try {
    ;({ userId } = await requireAdmin())
  } catch {
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

  const outcome = await resolveDispute(input, userId)
  switch (outcome.kind) {
    case 'ok':
      void writeAuditLog({
        adminId: userId,
        action: 'dispute.resolve',
        targetType: 'Dispute',
        targetId: input.disputeId,
        metadata: { verdict: input.verdict },
      })
      revalidatePath(`/admin/disputes/${input.disputeId}`)
      revalidatePath('/admin/disputes')
      return { ok: true }
    case 'dispute_not_found':
      return { ok: false, message: 'Litige introuvable.' }
    case 'not_claimer':
      return {
        ok: false,
        message: 'Ce litige est claimé par un autre admin.',
      }
    case 'wrong_status':
      return { ok: false, message: `Statut ${outcome.status} non résoluble.` }
  }
}
