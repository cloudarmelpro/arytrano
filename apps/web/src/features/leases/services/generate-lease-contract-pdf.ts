import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import {
  uploadLeasePdfBuffer,
  signLeasePdfUrl,
} from '@/lib/cloudinary/upload-pdf'
import { renderLeaseContractPdf } from '@/lib/pdf/render-lease-contract'

/**
 * E-T27.1 — generate the lease-contract PDF, upload to Cloudinary,
 * and stamp the result on the Lease row.
 *
 * Idempotent : if `contractPdfUrl` is already set, the service is a
 * no-op (returns `kind:'already_generated'`). Callers don't need to
 * branch on this — re-running after a partial failure (Cloudinary
 * timeout) is safe.
 *
 * Caller is responsible for triggering this AFTER the Lease has
 * flipped to ACTIVE — `apply-lease-payment-side-effect.ts` calls it
 * inside the deferred-notifications path so the webhook 200 isn't
 * blocked on Cloudinary's HTTP round-trip.
 */

export type GenerateLeaseContractPdfOutcome =
  | { kind: 'ok'; pdfUrl: string; signedDownloadUrl: string }
  | { kind: 'already_generated'; pdfUrl: string }
  | { kind: 'lease_not_found' }
  | { kind: 'lease_not_active'; currentStatus: string }

export async function generateLeaseContractPdf(
  leaseId: string,
): Promise<GenerateLeaseContractPdfOutcome> {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      monthlyRentMGA: true,
      cautionMGA: true,
      platformFeeMGA: true,
      startDate: true,
      durationMonths: true,
      ownerSignedAt: true,
      tenantSignedAt: true,
      contractPdfUrl: true,
      contractPdfPublicId: true,
      owner: { select: { name: true, email: true, phone: true } },
      tenant: { select: { name: true, email: true, phone: true } },
      listing: {
        select: {
          title: true,
          neighborhood: { select: { nameFr: true } },
          city: { select: { nameFr: true } },
        },
      },
    },
  })

  if (!lease) return { kind: 'lease_not_found' }

  if (lease.contractPdfUrl && lease.contractPdfPublicId) {
    return { kind: 'already_generated', pdfUrl: lease.contractPdfUrl }
  }

  if (lease.status !== 'ACTIVE') {
    return { kind: 'lease_not_active', currentStatus: lease.status }
  }

  const refShort = lease.id.slice(-6)
  const buffer = await renderLeaseContractPdf({
    leaseId: lease.id,
    refShort,
    owner: {
      name: lease.owner.name ?? lease.owner.email,
      email: lease.owner.email,
      phone: lease.owner.phone,
    },
    tenant: {
      name: lease.tenant.name ?? lease.tenant.email,
      email: lease.tenant.email,
      phone: lease.tenant.phone,
    },
    listing: {
      title: lease.listing.title,
      address: `${lease.listing.neighborhood.nameFr}, ${lease.listing.city.nameFr}`,
    },
    monthlyRentMGA: lease.monthlyRentMGA,
    cautionMGA: lease.cautionMGA,
    platformFeeMGA: lease.platformFeeMGA,
    durationMonths: lease.durationMonths,
    startDate: lease.startDate,
    ownerSignedAt: lease.ownerSignedAt,
    tenantSignedAt: lease.tenantSignedAt,
    generatedAt: new Date(),
  })

  let uploaded
  try {
    uploaded = await uploadLeasePdfBuffer(buffer, { leaseId: lease.id })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { feature: 'leases', step: 'pdf-upload' },
      extra: { leaseId },
    })
    throw err
  }

  await prisma.lease.update({
    where: { id: lease.id },
    data: {
      contractPdfUrl: uploaded.url,
      contractPdfPublicId: uploaded.publicId,
      contractPdfGeneratedAt: new Date(),
    },
  })

  return {
    kind: 'ok',
    pdfUrl: uploaded.url,
    signedDownloadUrl: signLeasePdfUrl(uploaded.publicId),
  }
}
