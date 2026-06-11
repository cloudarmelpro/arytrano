import 'server-only'
import { created, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { optionalBearer } from '@/lib/api/bearer'
import { createInterestLeadSchema } from '../schemas'
import { createInterestLead } from '../services/create-interest-lead'

/**
 * E-T28 T-RES-04 — POST /api/v1/leads
 *
 * Mobile + REST entrypoint. Bearer is OPTIONAL — anonymous tenants
 * submit too. When a valid token is present, `tenantUserId` is
 * resolved from it ; otherwise the lead is anonymous.
 *
 * Source = `MOBILE` by default for any REST hit ; web Server Action
 * sets `WEB` explicitly through the action path.
 */
export const makeCreateInterestLeadHandler = () =>
  withErrorHandling(async (req: Request) => {
    const body = await req.json()
    const input = createInterestLeadSchema.parse(body)

    // Bearer is optional. If present + valid, attach tenantUserId.
    const tenantUserId = await optionalBearer(req)
      .then((p) => p?.sub ?? null)
      .catch(() => null)

    const { ipHash } = extractRequestInfo(req.headers)

    const outcome = await createInterestLead(input, {
      tenantUserId,
      ipHash,
      source: 'MOBILE',
    })

    switch (outcome.kind) {
      case 'ok':
        return created({ leadId: outcome.leadId, createdAt: outcome.createdAt })
      case 'duplicate':
        return created({
          leadId: outcome.existingLeadId,
          duplicate: true,
        })
      case 'rate_limited':
        throw errors.rateLimited('Trop de demandes depuis ce numéro.')
      case 'listing_not_found':
        throw errors.notFound('Annonce introuvable.')
      case 'listing_not_rentable':
        throw errors.conflict('Cette annonce n’est plus disponible.')
    }
  })
