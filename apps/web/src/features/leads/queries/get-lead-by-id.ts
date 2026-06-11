import 'server-only'
import { prisma } from '@/lib/db'

/**
 * E-T28 — fetch a single lead for the admin detail page. Includes the
 * full LeadActivity timeline + the listing + owner + tenant context
 * the operator needs to act.
 */
export async function getLeadById(leadId: string) {
  return prisma.leadRequest.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      status: true,
      source: true,
      createdAt: true,
      updatedAt: true,
      claimedAt: true,
      slaDueAt: true,
      firstContactedAt: true,
      tenantUserId: true,
      tenantName: true,
      tenantPhone: true,
      moveInWindow: true,
      budgetConfirmed: true,
      leaseId: true,
      tenant: {
        select: { id: true, name: true, email: true, phone: true },
      },
      claimedBy: { select: { id: true, name: true } },
      listing: {
        select: {
          id: true,
          slug: true,
          title: true,
          priceMonthlyMGA: true,
          status: true,
          city: { select: { slug: true, nameFr: true } },
          neighborhood: { select: { slug: true, nameFr: true } },
          owner: {
            select: { id: true, name: true, email: true, phone: true, locale: true },
          },
        },
      },
      activities: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          type: true,
          actorRole: true,
          payload: true,
          createdAt: true,
          actor: { select: { id: true, name: true } },
        },
      },
    },
  })
}

export type LeadDetail = NonNullable<
  Awaited<ReturnType<typeof getLeadById>>
>
