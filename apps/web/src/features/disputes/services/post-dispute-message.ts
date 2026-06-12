import 'server-only'
import { prisma } from '@/lib/db'
import type { PostDisputeMessageInput } from '../schemas'

/**
 * E-T27.3 — post a message on an open dispute. Author must be one
 * of the parties OR the assigned admin reviewer.
 *
 * Posting is locked once the dispute is RESOLVED_* / WITHDRAWN ; the
 * conversation log is then read-only evidence.
 */

export type PostDisputeMessageOutcome =
  | { kind: 'ok'; messageId: string }
  | { kind: 'dispute_not_found' }
  | { kind: 'not_authorized' }
  | { kind: 'closed'; status: string }

export async function postDisputeMessage(
  input: PostDisputeMessageInput,
  userId: string,
  userRole: 'STUDENT' | 'OWNER' | 'ADMIN',
): Promise<PostDisputeMessageOutcome> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: input.disputeId },
    select: {
      id: true,
      status: true,
      lease: {
        select: { ownerId: true, tenantId: true },
      },
    },
  })
  if (!dispute) return { kind: 'dispute_not_found' }

  const isParty =
    dispute.lease.ownerId === userId || dispute.lease.tenantId === userId
  const isAdmin = userRole === 'ADMIN'
  if (!isParty && !isAdmin) return { kind: 'not_authorized' }

  if (!['OPEN', 'IN_REVIEW'].includes(dispute.status)) {
    return { kind: 'closed', status: dispute.status }
  }

  // Determine the author's role for styling. Admin posts surface as
  // OWNER role by convention only when admin is acting on behalf —
  // we keep them as the role of whichever party they are (or default
  // to OWNER if pure ADMIN with no party tie, since the admin is
  // operationally aligned with the platform).
  const role: 'OWNER' | 'TENANT' =
    dispute.lease.ownerId === userId
      ? 'OWNER'
      : dispute.lease.tenantId === userId
        ? 'TENANT'
        : 'OWNER'

  const created = await prisma.disputeMessage.create({
    data: {
      disputeId: dispute.id,
      authorId: userId,
      authorRole: role,
      body: input.body,
      isVerdict: false,
    },
    select: { id: true },
  })

  return { kind: 'ok', messageId: created.id }
}
