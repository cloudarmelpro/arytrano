'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/features/admin/server'
import { claimLead } from '../services/claim-lead'

export type ClaimLeadActionState = {
  ok: boolean
  message?: string
}

/**
 * E-T28 T-RES-04 — operator clicks "Je claim" in /admin/leads/:id.
 * ADMIN role-gated.
 *
 * SEC-21 — switched from JWT `session.user.role` to DB-fresh
 * `requireAdmin()` so a freshly demoted admin can no longer execute
 * concierge actions until their token refreshes.
 */
export async function claimLeadAction(
  leadId: string,
): Promise<ClaimLeadActionState> {
  let userId: string
  try {
    ;({ userId } = await requireAdmin())
  } catch {
    return { ok: false, message: 'Accès refusé.' }
  }

  const outcome = await claimLead(leadId, userId)

  switch (outcome.kind) {
    case 'ok':
      revalidatePath('/admin/leads')
      revalidatePath(`/admin/leads/${leadId}`)
      return { ok: true }
    case 'lead_not_found':
      return { ok: false, message: 'Lead introuvable.' }
    case 'already_claimed':
      return {
        ok: false,
        message: 'Ce lead est déjà claimé par un autre opérateur.',
      }
    case 'invalid_status':
      return {
        ok: false,
        message: `Statut invalide pour un claim (${outcome.currentStatus}).`,
      }
    case 'wip_cap_reached':
      return {
        ok: false,
        message: `Tu as atteint la limite de ${outcome.cap} leads en cours.`,
      }
  }
}
