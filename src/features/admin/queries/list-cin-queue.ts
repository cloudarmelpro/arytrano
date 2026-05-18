import 'server-only'
import { prisma } from '@/lib/db'

export type CinQueueRow = {
  userId: string
  email: string
  name: string | null
  phone: string | null
  submittedAt: Date
  mimeType: string | null
  /** True if this submission is a resubmission after a previous rejection
   *  — the admin should be a bit more diligent on the second pass. */
  wasRejectedBefore: boolean
}

/**
 * Pending CIN submissions awaiting admin review. Returns owners whose
 * `cinUploadedAt` is set but neither `verifiedAt` nor `cinRejectedAt`
 * has been written after that upload (re-uploads reset both, so the
 * row re-enters the queue). Ordered oldest-first so admins clear the
 * backlog in submission order.
 */
export async function listCinQueue(): Promise<CinQueueRow[]> {
  const rows = await prisma.ownerProfile.findMany({
    where: {
      cinUploadedAt: { not: null },
      // Pending = nothing decided yet for THIS upload. Since re-upload
      // wipes both verifiedAt and rejectedAt, presence of either means
      // the current row was already actioned (or is verified outright).
      verifiedAt: null,
      cinRejectedAt: null,
    },
    orderBy: { cinUploadedAt: 'asc' },
    select: {
      cinUploadedAt: true,
      cinMimeType: true,
      cinRejectionReason: true,
      user: { select: { id: true, email: true, name: true, phone: true } },
    },
  })

  return rows.map((r) => ({
    userId: r.user.id,
    email: r.user.email,
    name: r.user.name,
    phone: r.user.phone,
    submittedAt: r.cinUploadedAt!,
    mimeType: r.cinMimeType,
    // `cinRejectionReason` is null after a fresh re-upload (the submit
    // service clears it), so its presence is a soft proxy that won't
    // be reliable here. We keep the field for future use when we add
    // a CinHistoryEvent table.
    wasRejectedBefore: false,
  }))
}
