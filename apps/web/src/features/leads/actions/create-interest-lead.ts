'use server'

import { headers } from 'next/headers'
import { ZodError } from 'zod'
import { auth } from '@/features/auth'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { createInterestLeadSchema, type CreateInterestLeadInput } from '../schemas'
import { createInterestLead } from '../services/create-interest-lead'

export type CreateInterestLeadActionState = {
  ok: boolean
  /** Set on success — the public confirmation screen can deep-link to it. */
  leadId?: string
  message?: string
  /** Field-level errors for inline form rendering. */
  fields?: Record<string, string[]>
}

/**
 * E-T28 T-RES-04 — Server Action wrapping `createInterestLead`.
 *
 * Anonymous submissions allowed (no auth gate). The service relies on
 * the phone-hash + ip-hash double rate-limit to absorb spam ; the
 * operator does the final phone validation on first WhatsApp contact.
 *
 * OTP gate is a deliberate post-v1 hardening — T-002 phone-verification
 * infra not shipped yet (2026-06-10).
 */
export async function createInterestLeadAction(
  _prev: CreateInterestLeadActionState,
  formData: FormData,
): Promise<CreateInterestLeadActionState> {
  let input: CreateInterestLeadInput
  try {
    input = createInterestLeadSchema.parse({
      listingId: formData.get('listingId'),
      tenantName: formData.get('tenantName'),
      tenantPhone: formData.get('tenantPhone'),
      moveInWindow: formData.get('moveInWindow'),
      budgetConfirmed: formData.get('budgetConfirmed') === 'true',
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

  // Pull session id (if signed in) so we can attach the User to the lead.
  // Anonymous flows keep tenantUserId = null.
  const session = await auth()
  const tenantUserId = session?.user?.id ?? null

  // ipHash for rate-limit. Request-info reads Next's headers().
  const h = await headers()
  const { ipHash } = extractRequestInfo(h)

  const outcome = await createInterestLead(input, {
    tenantUserId,
    ipHash,
    source: 'WEB',
  })

  switch (outcome.kind) {
    case 'ok':
      return { ok: true, leadId: outcome.leadId }
    case 'duplicate':
      return {
        ok: true,
        leadId: outcome.existingLeadId,
        message:
          'On a déjà reçu votre demande pour ce logement. L’équipe vous rappelle bientôt.',
      }
    case 'rate_limited':
      return {
        ok: false,
        message:
          'Trop de demandes depuis ce numéro. Réessaie dans une heure.',
      }
    case 'otp_required':
      return {
        ok: false,
        message: 'Vérifie d’abord ton numéro avec le code SMS.',
        // Signal to the dialog UI : flip to the OTP step.
        fields: { _form: ['otp_required'] },
      }
    case 'listing_not_found':
      return { ok: false, message: 'Annonce introuvable.' }
    case 'listing_not_rentable':
      return {
        ok: false,
        message: 'Cette annonce n’est plus disponible.',
      }
  }
}
