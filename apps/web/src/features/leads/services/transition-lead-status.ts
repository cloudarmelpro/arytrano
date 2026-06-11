import 'server-only'
import type { LeadStatus, LeadActivityType } from '@prisma/client'
import { prisma } from '@/lib/db'
import type { TransitionLeadStatusInput } from '../schemas'
import { writeLeadActivity } from './write-lead-activity'

/**
 * E-T28 T-RES-02 — operator transitions a CLAIMED lead.
 *
 * Allowed transitions (state machine) :
 *
 *   CLAIMED          → IN_DISCUSSION | AWAITING_OWNER | AWAITING_TENANT | REJECTED
 *   IN_DISCUSSION    → AWAITING_OWNER | AWAITING_TENANT | REJECTED
 *   AWAITING_OWNER   → IN_DISCUSSION | AWAITING_TENANT | REJECTED
 *   AWAITING_TENANT  → IN_DISCUSSION | AWAITING_OWNER  | REJECTED
 *
 * NEW → CONVERTED is reserved for `linkLeadToLease` (it requires the
 * lease id). NEW → LAPSED is reserved for the cron. NEW → CLAIMED is
 * reserved for `claimLead` (it sets `claimedByUserId` + `slaDueAt`).
 *
 * Each transition writes a LeadActivity. The `type` is derived from the
 * (currentStatus, nextStatus, channel) tuple — a status flip with a
 * `channel` set means the operator logged an off-platform exchange,
 * which becomes a `MESSAGED` activity. Pure status flips become `NOTE`.
 *
 * The service trusts the operatorId — caller must verify ADMIN at the
 * action / handler boundary AND that the operator is the current
 * claimer (`claimedByUserId === operatorId`).
 */

const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW: [],
  CLAIMED: ['IN_DISCUSSION', 'AWAITING_OWNER', 'AWAITING_TENANT', 'REJECTED'],
  IN_DISCUSSION: ['AWAITING_OWNER', 'AWAITING_TENANT', 'REJECTED'],
  AWAITING_OWNER: ['IN_DISCUSSION', 'AWAITING_TENANT', 'REJECTED'],
  AWAITING_TENANT: ['IN_DISCUSSION', 'AWAITING_OWNER', 'REJECTED'],
  CONVERTED: [],
  LAPSED: [],
  REJECTED: [],
}

export type TransitionLeadStatusOutcome =
  | { kind: 'ok'; leadId: string; nextStatus: LeadStatus }
  | { kind: 'lead_not_found' }
  | { kind: 'not_claimer'; actualClaimer: string | null }
  | {
      kind: 'invalid_transition'
      currentStatus: LeadStatus
      attemptedStatus: LeadStatus
    }

export async function transitionLeadStatus(
  input: TransitionLeadStatusInput,
  operatorId: string,
): Promise<TransitionLeadStatusOutcome> {
  return prisma.$transaction(async (tx) => {
    const lead = await tx.leadRequest.findUnique({
      where: { id: input.leadId },
      select: {
        id: true,
        status: true,
        claimedByUserId: true,
        firstContactedAt: true,
      },
    })
    if (!lead) return { kind: 'lead_not_found' } as const
    if (lead.claimedByUserId !== operatorId) {
      return {
        kind: 'not_claimer',
        actualClaimer: lead.claimedByUserId,
      } as const
    }

    const allowed = VALID_TRANSITIONS[lead.status]
    if (!allowed.includes(input.nextStatus)) {
      return {
        kind: 'invalid_transition',
        currentStatus: lead.status,
        attemptedStatus: input.nextStatus,
      } as const
    }

    // Derive the activity type. A status flip with a channel set is
    // an off-platform contact log = MESSAGED. A REJECTED transition
    // ALWAYS gets a REJECTED activity (so analytics can count exits
    // by reason). Everything else is a NOTE.
    let activityType: LeadActivityType
    if (input.nextStatus === 'REJECTED') {
      activityType = 'REJECTED'
    } else if (input.channel) {
      activityType = 'MESSAGED'
    } else {
      activityType = 'NOTE'
    }

    const now = new Date()
    const setFirstContactedAt =
      input.channel && lead.firstContactedAt === null ? { firstContactedAt: now } : {}

    await tx.leadRequest.update({
      where: { id: input.leadId },
      data: {
        status: input.nextStatus,
        ...setFirstContactedAt,
      },
    })

    await writeLeadActivity(tx, {
      leadId: input.leadId,
      type: activityType,
      actorRole: 'OPERATOR',
      actorUserId: operatorId,
      payload: {
        from: lead.status,
        to: input.nextStatus,
        ...(input.note ? { note: input.note } : {}),
        ...(input.channel ? { channel: input.channel } : {}),
      },
    })

    return { kind: 'ok', leadId: input.leadId, nextStatus: input.nextStatus } as const
  })
}
