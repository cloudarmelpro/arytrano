import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { requireBearer } from '@/lib/api/bearer'
import { requireAdmin } from '@/lib/api/require-admin'
import { transitionLeadStatusSchema } from '../schemas'
import { transitionLeadStatus } from '../services/transition-lead-status'

/**
 * E-T28 T-RES-04 — POST /api/v1/leads/:id/transition
 *
 * ADMIN bearer required. Validates the body against the state machine
 * and writes a LeadActivity (type derived from channel + nextStatus).
 */
export const makeTransitionLeadHandler = () =>
  withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const payload = await requireBearer(req)
      await requireAdmin(payload.sub)

      const { id } = await ctx.params
      const body = await req.json()
      const input = transitionLeadStatusSchema.parse({ ...body, leadId: id })

      const outcome = await transitionLeadStatus(input, payload.sub)

      switch (outcome.kind) {
        case 'ok':
          return ok({ leadId: outcome.leadId, status: outcome.nextStatus })
        case 'lead_not_found':
          throw errors.notFound('Lead introuvable.')
        case 'not_claimer':
          throw errors.forbidden(
            'Tu n’es pas l’opérateur affecté à ce lead.',
          )
        case 'invalid_transition':
          throw errors.conflict(
            `Transition ${outcome.currentStatus} → ${outcome.attemptedStatus} non autorisée.`,
          )
      }
    },
  )
