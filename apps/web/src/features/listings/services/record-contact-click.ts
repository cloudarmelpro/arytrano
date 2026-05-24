import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { hashUa } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import type { ContactChannel } from '../schemas/contact'
import { notifyOwnerContact } from './notify-owner-contact'

export type RecordContactClickResult = {
  channel: ContactChannel
  /** E.164 digits-only phone (no `+`), suitable for wa.me/<x> or tel:<x>. */
  phoneE164: string
  ownerDisplayName: string
}

/**
 * Records a contact click against a PUBLISHED listing and returns the owner
 * phone so the client can open `wa.me/<x>` or `tel:<x>`. The phone is never
 * exposed in the public listing payload — only revealed once a contact event
 * has been logged.
 *
 * Anti-scraping defences (defense-in-depth):
 *  1. Every call is recorded in `ContactEvent` (owner sees the volume)
 *  2. 30/h per (IP, listing) rate-limit — caps single-IP harvesting
 *  3. `ipHash` lets us flag abusive IPs without storing raw IP
 */
export async function recordContactClick(input: {
  listingId: string
  channel: ContactChannel
  ipHash: string | null
  userAgent: string | null
  /**
   * Signed-in viewer's id, when present. Stamped onto the ContactEvent
   * so `Review.verifiedStay` (T-031) can confirm the reviewer actually
   * reached out before writing their avis. Null for anonymous reveals.
   */
  viewerId: string | null
}): Promise<RecordContactClickResult> {
  // Fail-CLOSED on null IP — bucket all unattributable reveals together
  // so a missing X-Forwarded-For header can't be used to bypass the cap.
  const rateLimitIp = input.ipHash ?? `noip:contact`
  const rl = await rateLimiters.contactReveal(rateLimitIp, input.listingId)
  if (!rl.success) {
    throw errors.rateLimited('Trop de demandes de contact. Réessaie dans une heure.')
  }

  const listing = await prisma.listing.findFirst({
    where: { id: input.listingId, status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      owner: {
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          locale: true,
          contactNotificationsEnabled: true,
          expoPushToken: true,
        },
      },
    },
  })

  if (!listing) {
    throw errors.notFound('Annonce introuvable')
  }
  if (!listing.owner.phone) {
    throw errors.conflict('Le propriétaire n\'a pas renseigné son numéro')
  }

  const phoneE164 = normalizePhoneE164(listing.owner.phone)
  if (!phoneE164) {
    throw errors.conflict('Numéro du propriétaire invalide')
  }

  // Hash the UA to keep parity with LoginEvent — never store raw UA strings.
  const uaHash = input.userAgent ? hashUa(input.userAgent) : null

  await prisma.contactEvent.create({
    data: {
      listingId: listing.id,
      channel: input.channel,
      // Sec P2-3 : match the rate-limit sentinel exactly
      // (`noip:contact`) so analytics queries on stored ipHash align
      // with the bucket the limiter uses. Was 'unknown' before.
      ipHash: input.ipHash ?? 'noip:contact',
      uaHash,
      viewerId: input.viewerId,
    },
  })

  // T-047 — notify the owner. Fire-and-forget : the student's reveal
  // MUST succeed even if SMTP is down, so we don't await the result.
  // notifyOwnerContact swallows its own errors; this `void` discards
  // the returned promise without leaking unhandledRejection.
  void notifyOwnerContact({
    ownerId: listing.owner.id,
    ownerEmail: listing.owner.email,
    ownerName: listing.owner.name,
    ownerLocale: listing.owner.locale,
    contactNotificationsEnabled: listing.owner.contactNotificationsEnabled,
    ownerPushToken: listing.owner.expoPushToken,
    listingId: listing.id,
    listingTitle: listing.title,
    channel: input.channel,
  })

  // Owner display name: first token only (privacy mirror of get-public-listing).
  const fullName = listing.owner.name?.trim() ?? ''
  const ownerDisplayName = fullName ? fullName.split(/\s+/)[0]! : 'Propriétaire'

  return {
    channel: input.channel,
    phoneE164,
    ownerDisplayName,
  }
}

/**
 * Normalize a phone input to E.164 digits-only (no leading `+`). Madagascar
 * country code is 261. Accepts these common shapes from user input:
 *   "+261 34 12 345 67"  → "261341234567"
 *   "0341234567"          → "261341234567"
 *   "261341234567"        → "261341234567"
 *   "341234567"           → "261341234567"
 *
 * Returns null unless the result is EXACTLY `261` + 9 digits (12 total).
 * Strict MG-only — we don't want to silently fail on `wa.me/<non-MG-number>`.
 * Owners with non-MG numbers should leave the field blank.
 */
function normalizePhoneE164(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  if (!digits) return null

  let normalized = digits
  if (normalized.startsWith('0')) {
    // Local Malagasy format (0XX XX XXX XX) — strip leading 0, prepend 261
    normalized = '261' + normalized.slice(1)
  } else if (!normalized.startsWith('261')) {
    // Bare local number (9 digits) — prepend country code
    normalized = '261' + normalized
  }

  // MG mobile = exactly `261` + 9 digits = 12 total
  if (normalized.length !== 12 || !normalized.startsWith('261')) return null
  return normalized
}
