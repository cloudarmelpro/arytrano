import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Fetch a Lease by id with the joins needed by the dashboard detail
 * page (owner + tenant identity, listing title, payment status).
 * Returns null when the lease doesn't exist OR when the requesting
 * user is neither owner nor tenant — authorization is enforced here
 * so callers can simply `if (!lease) notFound()`.
 */
export async function getLeaseById(leaseId: string, viewerId: string) {
  const lease = await prisma.lease.findFirst({
    where: {
      id: leaseId,
      OR: [{ ownerId: viewerId }, { tenantId: viewerId }],
    },
    select: {
      id: true,
      status: true,
      monthlyRentMGA: true,
      cautionMGA: true,
      startDate: true,
      durationMonths: true,
      signatureFeeMGA: true,
      cautionCommissionMGA: true,
      ownerSignedAt: true,
      tenantSignedAt: true,
      terminatedAt: true,
      createdAt: true,
      updatedAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
        },
      },
      owner: {
        select: { id: true, name: true, email: true },
      },
      tenant: {
        select: { id: true, name: true, email: true },
      },
      payment: {
        select: {
          id: true,
          status: true,
          amountMGA: true,
          providerTxId: true,
          completedAt: true,
        },
      },
    },
  })
  return lease
}

export type LeaseDetail = NonNullable<Awaited<ReturnType<typeof getLeaseById>>>
