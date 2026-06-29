'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/features/admin/server'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import { convertLeadToLease } from '../services/convert-lead-to-lease'

export type ConvertLeadActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
  leaseId?: string
}

/**
 * E-T28 T-RES-07 — operator-on-behalf lease conversion.
 *
 * ADMIN role-gated. The service double-checks the operator is the
 * current claimer of the lead.
 */
export async function convertLeadToLeaseAction(
  _prev: ConvertLeadActionState,
  formData: FormData,
): Promise<ConvertLeadActionState> {
  // SEC-21 — DB-fresh admin gate (was JWT session.user.role, stale).
  let userId: string
  try {
    ;({ userId } = await requireAdmin())
  } catch {
    return { ok: false, message: 'Accès refusé.' }
  }

  const outcome = await convertLeadToLease(
    {
      leadId: formData.get('leadId'),
      tenantEmail: formData.get('tenantEmail'),
      startDate: formData.get('startDate'),
      durationMonths: Number(formData.get('durationMonths')),
    },
    userId,
  )

  switch (outcome.kind) {
    case 'ok':
      void writeAuditLog({
        adminId: userId,
        action: 'lead.convert',
        targetType: 'LeadRequest',
        targetId: String(formData.get('leadId') ?? ''),
        metadata: { leaseId: outcome.leaseId },
      })
      revalidatePath(`/admin/leads/${formData.get('leadId')}`)
      revalidatePath('/admin/leads')
      revalidatePath(`/dashboard/leases/${outcome.leaseId}`)
      return { ok: true, leaseId: outcome.leaseId }
    case 'validation_failed': {
      const fields: Record<string, string[]> = {}
      for (const issue of outcome.issues) {
        const key = issue.path || '_form'
        fields[key] ??= []
        fields[key]?.push(issue.message)
      }
      return { ok: false, message: 'Champs invalides.', fields }
    }
    case 'lead_not_found':
      return { ok: false, message: 'Lead introuvable.' }
    case 'not_claimer':
      return { ok: false, message: 'Tu n’es pas l’opérateur affecté à ce lead.' }
    case 'invalid_status':
      return {
        ok: false,
        message: `Statut ${outcome.currentStatus} ne permet pas la conversion.`,
      }
    case 'listing_not_rentable':
      return {
        ok: false,
        message: `Annonce non rentable (${outcome.currentStatus}).`,
      }
    case 'tenant_not_found':
      return {
        ok: false,
        message: `Aucun compte AryTrano pour ${outcome.tenantEmail}. Demande au tenant de s’inscrire.`,
      }
    case 'tenant_is_owner':
      return {
        ok: false,
        message: 'Le tenant ne peut pas être le propriétaire.',
      }
    case 'existing_lease':
      return {
        ok: false,
        message: `Un bail ${outcome.status} existe déjà (${outcome.existingLeaseId}).`,
      }
  }
}
