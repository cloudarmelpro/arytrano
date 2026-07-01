import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { env } from '@/lib/env'
import { hashUa } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import type { ContactChannel } from '../schemas/contact'
import { notifyOwnerContact } from './notify-owner-contact'
import { sendPushToUser } from '@/lib/push/web-push'

export type RecordContactClickResult = {
  channel: ContactChannel
  /**
   * AryTrano concierge hotline in E.164 digits-only. Same number is
   * returned for both WHATSAPP and PHONE channels — AryTrano is the
   * sole intermediary; the owner's number is never exposed.
   */
  phoneE164: string
  /**
   * Pre-filled WhatsApp message the visitor's client opens with. Helps
   * the AryTrano team see which listing the inquiry is about. Always
   * returned; the client only uses it on the WhatsApp channel.
   */
  whatsappPrefilledText: string
  ownerDisplayName: string
}

/**
 * Records a contact click against a PUBLISHED listing and returns the
 * AryTrano CONCIERGE hotline (not the owner's number) so the visitor
 * opens `wa.me/<arytrano>?text=…` or `tel:<arytrano>`.
 *
 * AryTrano sits between visitor and owner : the owner's phone is never
 * exposed in the public payload nor returned by this service. The team
 * receives the inquiry via the pre-filled WhatsApp message (which names
 * the listing) and relays to the owner offline.
 *
 * Anti-scraping defences (defense-in-depth, still relevant even when
 * the returned number is shared) :
 *  1. Every call is recorded in `ContactEvent` so owner sees the volume
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
      slug: true,
      // Owner.phone is still selected so the gating + future
      // owner-side reveal in the dashboard still works, but it is
      // NEVER returned from this service.
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
    // We still gate on the owner having a phone : AryTrano needs a
    // way to forward the inquiry offline. Hide the contact UI when
    // the owner hasn't provided one.
    throw errors.conflict('Le propriétaire n\'a pas renseigné son numéro')
  }

  // Choose the AryTrano hotline for the requested channel. Today they
  // are the same number, but the schema supports splitting later
  // (e.g. dedicated WhatsApp Business vs voice).
  const phoneE164 =
    input.channel === 'WHATSAPP'
      ? env.NEXT_PUBLIC_ARYTRANO_WHATSAPP
      : env.NEXT_PUBLIC_ARYTRANO_PHONE

  if (!phoneE164) {
    // Should not happen since the Zod schema enforces format + default,
    // but defensive — never return an empty number to the client.
    throw errors.conflict('Hotline AryTrano non configurée')
  }

  // Pre-filled WhatsApp message (concierge model). Names the listing
  // by title + slug so the AryTrano agent immediately knows context.
  const whatsappPrefilledText = buildWhatsAppPrefilledText({
    listingTitle: listing.title,
    listingSlug: listing.slug,
  })

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

  // OWN-12 — web push. Independent of the mobile Expo push above so
  // desktop-only owners can also get the ring. Fire-and-forget.
  void sendPushToUser(listing.owner.id, {
    title: 'Nouveau contact sur ton annonce',
    body: listing.title,
    url: `/dashboard/listings`,
    tag: `contact-${listing.id}`,
  })

  // Owner display name: first token only (privacy mirror of get-public-listing).
  const fullName = listing.owner.name?.trim() ?? ''
  const ownerDisplayName = fullName ? fullName.split(/\s+/)[0]! : 'Propriétaire'

  return {
    channel: input.channel,
    phoneE164,
    whatsappPrefilledText,
    ownerDisplayName,
  }
}

/**
 * Build the WhatsApp pre-filled message body. Plain text (wa.me URL
 * percent-encodes downstream). Keep it short — long lines wrap awkwardly
 * in WhatsApp on small screens. We name the listing by title and slug
 * so the team can locate it instantly even if the URL gets stripped by
 * an aggressive link cleaner.
 */
function buildWhatsAppPrefilledText(input: {
  listingTitle: string
  listingSlug: string
}): string {
  return (
    `Bonjour AryTrano, je suis intéressé(e) par l'annonce "${input.listingTitle}" ` +
    `(réf ${input.listingSlug}) sur arytrano.com. Merci !`
  )
}

// `normalizePhoneE164` was removed when the concierge model landed —
// AryTrano's hotline comes pre-validated via env.ts. If a future
// owner-dashboard reveal flow needs it back, port from git history or
// move it into `features/listings/utils/normalize-phone-e164.ts`.
