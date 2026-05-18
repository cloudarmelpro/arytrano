import 'server-only'
import { ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { encryptPii, PiiKeyMissingError } from '@/lib/auth/pii-encryption'
import { sniffImage } from '@/lib/images/sniff'
import { parseCinFile } from '../schemas/cin'

export type CinSubmitResult = {
  /** True if a previous submission was overwritten (resubmission after reject). */
  resubmitted: boolean
}

/**
 * Owner uploads their national ID (CIN) for admin verification (T-038).
 *
 * Pipeline:
 *  1. Validate file type + size at the schema layer.
 *  2. Magic-bytes sniff for raster types (PDF is allowed but skip the
 *     sniff since `file-type` returns it correctly as "application/pdf"
 *     when present — we accept that branch).
 *  3. Encrypt the bytes with AES-256-GCM (PII_ENCRYPTION_KEY).
 *  4. Upsert the OwnerProfile row with the ciphertext + reset any
 *     previous rejection so admins re-process.
 *
 * Never logs the plaintext — even the size is enough to fingerprint
 * specific documents in some forensic contexts. Logs only the user id.
 */
export async function submitCinForVerification(
  ownerId: string,
  file: File,
): Promise<CinSubmitResult> {
  try {
    parseCinFile(file)
  } catch (err) {
    if (err instanceof ZodError) {
      throw errors.validation(err.issues[0]?.message ?? 'Fichier invalide')
    }
    throw err
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // For raster types, run the magic-bytes sniff to block polyglot uploads.
  // PDF is allowed through the schema but we still want to verify the
  // declared MIME matches the content.
  if (file.type !== 'application/pdf') {
    const sniff = await sniffImage(buffer)
    if (!sniff.ok) {
      console.warn('[submit-cin] magic-bytes rejected', { ownerId, reason: sniff.reason })
      throw errors.validation('Fichier non reconnu comme image valide')
    }
  } else {
    // Minimal PDF signature check — first 4 bytes must be "%PDF".
    const head = buffer.subarray(0, 4).toString('ascii')
    if (head !== '%PDF') {
      console.warn('[submit-cin] PDF header missing', { ownerId })
      throw errors.validation('Fichier PDF invalide')
    }
  }

  let encrypted
  try {
    encrypted = encryptPii(buffer)
  } catch (err) {
    if (err instanceof PiiKeyMissingError) {
      console.error('[submit-cin] PII_ENCRYPTION_KEY missing — cannot accept upload')
      throw errors.internal(
        "La vérification d'identité est temporairement indisponible. Réessaie plus tard.",
      )
    }
    throw err
  }

  // Detect prior submission state to surface "resubmitted" vs first upload.
  const existing = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
    select: { cinUploadedAt: true },
  })
  const resubmitted = Boolean(existing?.cinUploadedAt)

  // Prisma's `Bytes` column expects `Uint8Array<ArrayBuffer>` — wrap the
  // Buffer instances explicitly so TypeScript stops worrying about the
  // SharedArrayBuffer branch of `ArrayBufferLike`.
  const ciphertextBytes = new Uint8Array(encrypted.ciphertext)
  const ivBytes = new Uint8Array(encrypted.iv)
  const authTagBytes = new Uint8Array(encrypted.authTag)

  await prisma.ownerProfile.upsert({
    where: { userId: ownerId },
    create: {
      userId: ownerId,
      cinCiphertext: ciphertextBytes,
      cinIv: ivBytes,
      cinAuthTag: authTagBytes,
      cinKeyVersion: encrypted.keyVersion,
      cinMimeType: file.type,
      cinUploadedAt: new Date(),
    },
    update: {
      cinCiphertext: ciphertextBytes,
      cinIv: ivBytes,
      cinAuthTag: authTagBytes,
      cinKeyVersion: encrypted.keyVersion,
      cinMimeType: file.type,
      cinUploadedAt: new Date(),
      // Wipe any previous outcome so admin sees this in the queue again.
      verifiedAt: null,
      verifiedBy: null,
      cinRejectionReason: null,
      cinRejectedAt: null,
      cinRejectedBy: null,
    },
  })

  return { resubmitted }
}

/**
 * Owner-side status read (T-038 + dashboard). Returns the minimum the UI
 * needs to render the verification banner — NEVER returns the ciphertext.
 */
export type CinStatus =
  | { state: 'none' }
  | { state: 'pending'; submittedAt: Date }
  | { state: 'verified'; verifiedAt: Date }
  | { state: 'rejected'; rejectedAt: Date; reason: string | null }

export async function getCinStatus(ownerId: string): Promise<CinStatus> {
  const row = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
    select: {
      cinUploadedAt: true,
      verifiedAt: true,
      cinRejectedAt: true,
      cinRejectionReason: true,
    },
  })
  if (!row || !row.cinUploadedAt) return { state: 'none' }
  if (row.verifiedAt) return { state: 'verified', verifiedAt: row.verifiedAt }
  if (row.cinRejectedAt) {
    return {
      state: 'rejected',
      rejectedAt: row.cinRejectedAt,
      reason: row.cinRejectionReason,
    }
  }
  return { state: 'pending', submittedAt: row.cinUploadedAt }
}
