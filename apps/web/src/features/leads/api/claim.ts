import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { requireBearer } from '@/lib/api/bearer'
import { requireAdmin } from '@/lib/api/require-admin'
import { claimLead } from '../services/claim-lead'

/**
 * E-T28 T-RES-04 — POST /api/v1/leads/:id/claim
 *
 * ADMIN bearer required. Server-enforced WIP cap = 6.
 */
export const makeClaimLeadHandler = () =>
  withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const payload = await requireBearer(req)
      await requireAdmin(payload.sub)

      const { id } = await ctx.params
      const outcome = await claimLead(id, payload.sub)

      switch (outcome.kind) {
        case 'ok':
          return ok({ leadId: outcome.leadId, slaDueAt: outcome.slaDueAt })
        case 'lead_not_found':
          throw errors.notFound('Lead introuvable.')
        case 'already_claimed':
          throw errors.conflict('Lead déjà claimé.')
        case 'invalid_status':
          throw errors.conflict(
            `Statut invalide pour un claim (${outcome.currentStatus}).`,
          )
        case 'wip_cap_reached':
          throw errors.conflict(
            `Limite ${outcome.cap} leads en cours atteinte.`,
          )
      }
    },
  )
