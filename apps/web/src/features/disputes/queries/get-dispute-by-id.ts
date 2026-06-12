import 'server-only'
import { prisma } from '@/lib/db'

export async function getDisputeById(disputeId: string) {
  return prisma.dispute.findUnique({
    where: { id: disputeId },
    select: {
      id: true,
      status: true,
      openedById: true,
      openedByRole: true,
      initialClaim: true,
      amountAtStakeMGA: true,
      slaDueAt: true,
      leaseStatusAtOpen: true,
      claimedById: true,
      claimedAt: true,
      resolvedAt: true,
      verdict: true,
      resolvedById: true,
      createdAt: true,
      lease: {
        select: {
          id: true,
          status: true,
          ownerId: true,
          tenantId: true,
          monthlyRentMGA: true,
          cautionMGA: true,
          startDate: true,
          terminatedAt: true,
          listing: { select: { title: true } },
          owner: { select: { id: true, name: true, email: true } },
          tenant: { select: { id: true, name: true, email: true } },
          inventoryItems: {
            orderBy: [{ phase: 'asc' }, { roomKey: 'asc' }],
            select: {
              id: true,
              phase: true,
              roomKey: true,
              notes: true,
              photoUrls: true,
            },
          },
        },
      },
      claimedBy: { select: { id: true, name: true } },
      resolvedBy: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          body: true,
          authorRole: true,
          isVerdict: true,
          createdAt: true,
          author: { select: { id: true, name: true, role: true } },
        },
      },
    },
  })
}

export type DisputeDetail = NonNullable<
  Awaited<ReturnType<typeof getDisputeById>>
>
