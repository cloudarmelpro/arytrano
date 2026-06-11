import 'server-only'
import { z } from 'zod'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { requireBearer } from '@/lib/api/bearer'
import { requireAdmin } from '@/lib/api/require-admin'
import { linkLeadToLease } from '../services/link-lead-to-lease'

const bodySchema = z.object({
  leaseId: z.string().regex(/^c[a-z0-9]{20,40}$/, 'Identifiant invalide'),
})

/**
 * E-T28 T-RES-04 — POST /api/v1/leads/:id/link-lease
 *
 * ADMIN bearer required. Stamps the leaseId on the LeadRequest and
 * transitions to CONVERTED. Idempotent at the service layer.
 */
export const makeLinkLeadLeaseHandler = () =>
  withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const payload = await requireBearer(req)
      await requireAdmin(payload.sub)

      const { id } = await ctx.params
      const body = await req.json()
      const { leaseId } = bodySchema.parse(body)

      const outcome = await linkLeadToLease(
        { leadId: id, leaseId },
        payload.sub,
      )

      switch (outcome.kind) {
        case 'ok':
          return ok({ leadId: outcome.leadId, leaseId: outcome.leaseId })
        case 'lead_not_found':
          throw errors.notFound('Lead introuvable.')
        case 'not_claimer':
          throw errors.forbidden(
            'Tu n’es pas l’opérateur affecté à ce lead.',
          )
        case 'invalid_status':
          throw errors.conflict(
            `Statut ${outcome.currentStatus} ne permet pas la conversion.`,
          )
        case 'already_linked_to_other':
          throw errors.conflict(
            `Lead déjà lié à ${outcome.existingLeaseId}.`,
          )
      }
    },
  )
