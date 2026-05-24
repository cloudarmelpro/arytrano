import 'server-only'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { errors } from '@/lib/api/errors'
import { decryptPii } from '@/lib/auth/pii-encryption'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildCinResultEmail } from '@/lib/email/templates/cin-result'

export type CinReviewActionResult = { ownerId: string }

/**
 * Admin approves a pending CIN submission (T-039). Sets `verifiedAt` +
 * `verifiedBy`; idempotent on re-approval (refreshes `verifiedBy` to the
 * current admin). Clears any prior rejection markers.
 */
export async function verifyOwnerCin(
  adminId: string,
  ownerId: string,
): Promise<CinReviewActionResult> {
  const profile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
    select: {
      id: true,
      cinUploadedAt: true,
      verifiedAt: true,
      user: { select: { email: true, name: true, locale: true } },
    },
  })
  if (!profile?.cinUploadedAt) {
    throw errors.notFound('Aucune CIN à vérifier pour cet utilisateur')
  }

  await prisma.ownerProfile.update({
    where: { id: profile.id },
    data: {
      // Preserve the original `verifiedAt` on re-approve so the timeline
      // stays meaningful — only set it on the first approval.
      ...(profile.verifiedAt ? {} : { verifiedAt: new Date() }),
      verifiedBy: adminId,
      cinRejectionReason: null,
      cinRejectedAt: null,
      cinRejectedBy: null,
    },
  })

  // T-040: notify the owner — only the FIRST approval emits an email so
  // re-approval cycles don't spam. Rate limit catches anything beyond.
  if (!profile.verifiedAt) {
    const baseUrl = env.AUTH_URL.replace(/\/$/, '')
    const email = buildCinResultEmail(
      fromPrismaLocale(profile.user.locale),
      'approved',
      {
        recipientName: profile.user.name ?? 'Propriétaire',
        dashboardUrl: `${baseUrl}/dashboard/verify-owner`,
      },
    )
    void sendTransactionalEmail({
      recipientId: ownerId,
      recipientEmail: profile.user.email,
      eventType: 'cin-approved',
      ...email,
    })
  }

  return { ownerId }
}

/**
 * Admin rejects a pending CIN submission. Stores the user-facing reason
 * verbatim (server-trimmed) and clears any prior approval.
 */
export async function rejectOwnerCin(
  adminId: string,
  ownerId: string,
  reason: string,
): Promise<CinReviewActionResult> {
  const trimmed = reason.trim()
  if (trimmed.length < 5) {
    throw errors.validation('Motif trop court (5 caractères minimum)')
  }
  if (trimmed.length > 500) {
    throw errors.validation('Motif trop long (500 caractères maximum)')
  }

  const profile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
    select: {
      id: true,
      cinUploadedAt: true,
      user: { select: { email: true, name: true, locale: true } },
    },
  })
  if (!profile?.cinUploadedAt) {
    throw errors.notFound('Aucune CIN à rejeter pour cet utilisateur')
  }

  await prisma.ownerProfile.update({
    where: { id: profile.id },
    data: {
      cinRejectionReason: trimmed,
      cinRejectedAt: new Date(),
      cinRejectedBy: adminId,
      verifiedAt: null,
      verifiedBy: null,
    },
  })

  // T-040: notify the owner with the user-facing reason so they can fix +
  // resubmit. Fail-soft as everywhere — never blocks the admin action.
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const email = buildCinResultEmail(
    fromPrismaLocale(profile.user.locale),
    'rejected',
    {
      recipientName: profile.user.name ?? 'Propriétaire',
      rejectionReason: trimmed,
      dashboardUrl: `${baseUrl}/dashboard/verify-owner`,
    },
  )
  void sendTransactionalEmail({
    recipientId: ownerId,
    recipientEmail: profile.user.email,
    eventType: 'cin-rejected',
    ...email,
  })

  return { ownerId }
}

/**
 * Decrypt the CIN bytes for admin viewing. NEVER call from any other
 * surface — every admin-side decrypt is logged for audit (see
 * `docs/legal-cin-compliance.md` §6). Returns `null` when the row has no
 * ciphertext (already purged after 6 months per retention policy).
 */
export async function decryptOwnerCin(input: {
  adminId: string
  ownerId: string
}): Promise<{ mimeType: string; bytes: Buffer } | null> {
  const row = await prisma.ownerProfile.findUnique({
    where: { userId: input.ownerId },
    select: {
      cinCiphertext: true,
      cinIv: true,
      cinAuthTag: true,
      cinKeyVersion: true,
      cinMimeType: true,
    },
  })
  if (!row?.cinCiphertext || !row.cinIv || !row.cinAuthTag) return null

  // TODO (legal §6): persist a `CinAccessEvent` row recording the admin
  // who decrypted + the timestamp. Skipped in this batch — the model
  // doesn't exist yet and audit table is its own ticket.
  console.info('[cin-access]', {
    adminId: input.adminId,
    ownerId: input.ownerId,
    at: new Date().toISOString(),
  })

  const bytes = decryptPii({
    ciphertext: Buffer.from(row.cinCiphertext),
    iv: Buffer.from(row.cinIv),
    authTag: Buffer.from(row.cinAuthTag),
    keyVersion: row.cinKeyVersion,
  })
  return { mimeType: row.cinMimeType ?? 'application/octet-stream', bytes }
}
