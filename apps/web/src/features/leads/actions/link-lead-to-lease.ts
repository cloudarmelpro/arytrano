'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/features/admin/server'
import { linkLeadToLease } from '../services/link-lead-to-lease'

export type LinkLeadActionState = {
  ok: boolean
  message?: string
}

/**
 * E-T28 T-RES-04 — operator just initiated a Lease via the LeaseWizard
 * deep-link. This action stamps the link on the LeadRequest and flips
 * status → CONVERTED. Called from the operator UI after the lease is
 * created (the wizard's success callback).
 *
 * Idempotent at the service level — safe to retry.
 */
export async function linkLeadToLeaseAction(
  leadId: string,
  leaseId: string,
): Promise<LinkLeadActionState> {
  // SEC-21 — DB-fresh admin gate (was JWT session.user.role, stale).
  let userId: string
  try {
    ;({ userId } = await requireAdmin())
  } catch {
    return { ok: false, message: 'Accès refusé.' }
  }

  const outcome = await linkLeadToLease({ leadId, leaseId }, userId)

  switch (outcome.kind) {
    case 'ok':
      revalidatePath(`/admin/leads/${leadId}`)
      revalidatePath('/admin/leads')
      return { ok: true }
    case 'lead_not_found':
      return { ok: false, message: 'Lead introuvable.' }
    case 'not_claimer':
      return {
        ok: false,
        message: 'Tu n’es pas l’opérateur affecté à ce lead.',
      }
    case 'invalid_status':
      return {
        ok: false,
        message: `Statut ${outcome.currentStatus} ne permet pas la conversion.`,
      }
    case 'already_linked_to_other':
      return {
        ok: false,
        message: `Lead déjà lié à un autre bail (${outcome.existingLeaseId}).`,
      }
  }
}
