'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { requireAdmin } from '@/features/admin/server'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import {
  transitionLeadStatusSchema,
  type TransitionLeadStatusInput,
} from '../schemas'
import { transitionLeadStatus } from '../services/transition-lead-status'

export type TransitionLeadActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

/**
 * E-T28 T-RES-04 — operator advances/rolls back a claimed lead. The
 * service enforces the state machine + caller-is-claimer check.
 */
export async function transitionLeadStatusAction(
  _prev: TransitionLeadActionState,
  formData: FormData,
): Promise<TransitionLeadActionState> {
  // SEC-21 — DB-fresh admin gate (was JWT session.user.role, stale).
  let userId: string
  try {
    ;({ userId } = await requireAdmin())
  } catch {
    return { ok: false, message: 'Accès refusé.' }
  }

  let input: TransitionLeadStatusInput
  try {
    input = transitionLeadStatusSchema.parse({
      leadId: formData.get('leadId'),
      nextStatus: formData.get('nextStatus'),
      note: formData.get('note') ?? undefined,
      channel: formData.get('channel') ?? undefined,
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

  const outcome = await transitionLeadStatus(input, userId)

  switch (outcome.kind) {
    case 'ok':
      void writeAuditLog({
        adminId: userId,
        action: 'lead.transition',
        targetType: 'LeadRequest',
        targetId: input.leadId,
        metadata: { nextStatus: input.nextStatus },
      })
      revalidatePath(`/admin/leads/${input.leadId}`)
      revalidatePath('/admin/leads')
      return { ok: true }
    case 'lead_not_found':
      return { ok: false, message: 'Lead introuvable.' }
    case 'not_claimer':
      return {
        ok: false,
        message: 'Tu n’es pas l’opérateur affecté à ce lead.',
      }
    case 'invalid_transition':
      return {
        ok: false,
        message: `Transition ${outcome.currentStatus} → ${outcome.attemptedStatus} non autorisée.`,
      }
  }
}
