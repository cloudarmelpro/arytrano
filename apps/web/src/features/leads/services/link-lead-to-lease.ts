import 'server-only'
import { prisma } from '@/lib/db'
import { writeLeadActivity } from './write-lead-activity'

/**
 * E-T28 T-RES-02 — operator just created the Lease via the
 * LeaseWizard deep-link (T-RES-07). The service stamps `leaseId` on
 * the LeadRequest, flips status to CONVERTED, and writes a CONVERTED
 * LeadActivity.
 *
 * Authorization is the caller's responsibility — the action / handler
 * boundary must verify the operator is ADMIN AND that the operator is
 * the current claimer of the lead.
 *
 * Idempotent : if the lead is already CONVERTED with the same leaseId
 * we return `ok` (re-running the link after a partial failure is
 * safe).
 */

export type LinkLeadToLeaseOutcome =
  | { kind: 'ok'; leadId: string; leaseId: string }
  | { kind: 'lead_not_found' }
  | { kind: 'not_claimer'; actualClaimer: string | null }
  | { kind: 'invalid_status'; currentStatus: string }
  | { kind: 'already_linked_to_other'; existingLeaseId: string }

export async function linkLeadToLease(
  input: { leadId: string; leaseId: string },
  operatorId: string,
): Promise<LinkLeadToLeaseOutcome> {
  return prisma.$transaction(async (tx) => {
    const lead = await tx.leadRequest.findUnique({
      where: { id: input.leadId },
      select: {
        id: true,
        status: true,
        claimedByUserId: true,
        leaseId: true,
      },
    })
    if (!lead) return { kind: 'lead_not_found' } as const
    if (lead.claimedByUserId !== operatorId) {
      return {
        kind: 'not_claimer',
        actualClaimer: lead.claimedByUserId,
      } as const
    }

    // Idempotent re-run.
    if (lead.status === 'CONVERTED' && lead.leaseId === input.leaseId) {
      return { kind: 'ok', leadId: lead.id, leaseId: input.leaseId } as const
    }
    // Already linked to a DIFFERENT lease — that's a programmer bug, not
    // an operator action. Surface explicitly.
    if (lead.leaseId && lead.leaseId !== input.leaseId) {
      return {
        kind: 'already_linked_to_other',
        existingLeaseId: lead.leaseId,
      } as const
    }
    // Only "in-flight" statuses can convert. NEW shouldn't reach here
    // (operator must claim first), LAPSED / REJECTED are terminal.
    const inFlight = ['CLAIMED', 'IN_DISCUSSION', 'AWAITING_OWNER', 'AWAITING_TENANT']
    if (!inFlight.includes(lead.status)) {
      return { kind: 'invalid_status', currentStatus: lead.status } as const
    }

    await tx.leadRequest.update({
      where: { id: input.leadId },
      data: {
        status: 'CONVERTED',
        leaseId: input.leaseId,
      },
    })

    await writeLeadActivity(tx, {
      leadId: input.leadId,
      type: 'CONVERTED',
      actorRole: 'OPERATOR',
      actorUserId: operatorId,
      payload: { leaseId: input.leaseId, fromStatus: lead.status },
    })

    return { kind: 'ok', leadId: input.leadId, leaseId: input.leaseId } as const
  })
}
