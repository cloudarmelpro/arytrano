import 'server-only'
import { after } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { hashPhone } from '@/lib/auth/hash-phone'
import { rateLimiters } from '@/lib/rate-limit'
import { hasRecentlyVerifiedPhone } from '@/features/phone-otp/server'
import type { CreateInterestLeadInput } from '../schemas'
import { notifyOperatorsOnNewLead } from './notify-operators-on-new-lead'
import { writeLeadActivity } from './write-lead-activity'

/**
 * E-T28 T-RES-02 — public-detail CTA "Je suis intéressé(e)".
 *
 * Creates a LeadRequest in `NEW` + a `CREATED` LeadActivity in one
 * transaction. Anti-spam + rate-limit run BEFORE the write so a busted
 * client can't flood the table.
 *
 * The push fan-out to on-shift operators is delegated to T-RES-09 —
 * this service returns the freshly created lead id and lets the
 * action / API layer call the push side-effect via `after()`.
 *
 * Anonymous submissions are explicit (no signed-in tenant). When the
 * user IS signed in, the caller passes `tenantUserId`. The service
 * does NOT read the session itself — that lives at the action /
 * handler boundary so the service stays unit-testable.
 */

export type CreateInterestLeadOutcome =
  | {
      kind: 'ok'
      leadId: string
      createdAt: Date
    }
  | { kind: 'duplicate'; existingLeadId: string }
  | { kind: 'listing_not_found' }
  | { kind: 'listing_not_rentable'; currentStatus: string }
  | { kind: 'rate_limited' }
  /** T-002 — phone OTP gate not satisfied. Caller redirects to verify dialog. */
  | { kind: 'otp_required' }

// A second submission from the same SIM on the same listing within this
// window is treated as a duplicate. 24h was chosen to match the
// owner-response SLA target — past that, a fresh lead is legitimate
// (the tenant might be checking a status update by submitting again).
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000

export async function createInterestLead(
  input: CreateInterestLeadInput,
  context: {
    /** Bearer-resolved tenant id when the visitor is signed in; null otherwise. */
    tenantUserId: string | null
    /** Hashed source IP for rate-limit + audit. Null = behind proxy / unattributable. */
    ipHash: string | null
    /** LeadRequest.source — fan-in for analytics + future per-channel quotas. */
    source: 'WEB' | 'MOBILE' | 'REST'
  },
): Promise<CreateInterestLeadOutcome> {
  const tenantPhoneHash = hashPhone(input.tenantPhone)

  // 1) Rate limit — fail CLOSED on null ipHash via the wrapper.
  const rl = await rateLimiters.leadSubmit(tenantPhoneHash, context.ipHash)
  if (!rl.success) {
    return { kind: 'rate_limited' }
  }

  // 1bis) T-002 — phone OTP gate. The visitor MUST have a recent
  //       PhoneOtp.verifiedAt for this phone (15 min window) before
  //       we persist the lead. Signed-in tenants are exempted because
  //       their account is already trusted.
  if (!context.tenantUserId) {
    const ok = await hasRecentlyVerifiedPhone(input.tenantPhone)
    if (!ok) return { kind: 'otp_required' }
  }

  // 2) Listing must exist + be rentable. RENTED + UNAVAILABLE listings
  //    are still on the platform but visitors can't generate leads
  //    against them (the queue would clutter with dead requests).
  //    Pull title here too so the push fan-out below (T-RES-09)
  //    doesn't need a second round-trip.
  const listing = await prisma.listing.findUnique({
    where: { id: input.listingId },
    select: { id: true, status: true, title: true },
  })
  if (!listing) return { kind: 'listing_not_found' }
  if (listing.status !== 'PUBLISHED') {
    return { kind: 'listing_not_rentable', currentStatus: listing.status }
  }

  // 3) Anti-duplicate-spam — same phone hash on same listing within
  //    24h. The DB index `[tenantPhoneHash, listingId, createdAt]`
  //    makes this O(log n).
  const recentDuplicate = await prisma.leadRequest.findFirst({
    where: {
      tenantPhoneHash,
      listingId: input.listingId,
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  if (recentDuplicate) {
    return { kind: 'duplicate', existingLeadId: recentDuplicate.id }
  }

  // 4) Create LeadRequest + CREATED LeadActivity atomically. The
  //    activity row is part of the same tx so the timeline can never
  //    miss the genesis entry — operators rely on it as the t=0
  //    timestamp.
  const { id, createdAt } = await prisma.$transaction(async (tx) => {
    const lead = await tx.leadRequest.create({
      data: {
        listingId: input.listingId,
        tenantUserId: context.tenantUserId,
        tenantName: input.tenantName,
        tenantPhone: input.tenantPhone,
        tenantPhoneHash,
        moveInWindow: input.moveInWindow,
        budgetConfirmed: input.budgetConfirmed,
        status: 'NEW',
        source: context.source,
      },
      select: { id: true, createdAt: true },
    })

    await writeLeadActivity(tx, {
      leadId: lead.id,
      type: 'CREATED',
      actorRole: context.tenantUserId ? 'TENANT' : 'SYSTEM',
      actorUserId: context.tenantUserId,
      payload: {
        source: context.source,
        moveInWindow: input.moveInWindow,
        budgetConfirmed: input.budgetConfirmed,
      },
    })

    return lead
  })

  // 5) Telemetry. Tag the lead id so we can correlate Sentry events to
  //    the dashboard. Never log raw phone / name (per memory
  //    `feedback_debug_logs_no_pii`).
  Sentry.captureMessage('lead.created', {
    level: 'info',
    tags: { feature: 'leads', source: context.source },
    extra: { leadId: id, listingId: input.listingId },
  })

  // 6) Push fan-out to on-shift operators (T-RES-09). Deferred via
  //    `after()` so the visitor's response flushes immediately —
  //    Expo's HTTP round-trip is ~150-400 ms and adds nothing the
  //    submitter cares about.
  //    `after()` throws outside a request scope (tests, scripts) —
  //    catch and fall through to fire-and-forget so the happy path
  //    is unchanged.
  const notifyTask = () =>
    notifyOperatorsOnNewLead(id, {
      listingTitle: listing.title,
      listingId: input.listingId,
    }).catch((err) =>
      Sentry.captureException(err, {
        tags: { feature: 'leads', step: 'notify-after' },
        extra: { leadId: id },
      }),
    )
  try {
    after(notifyTask)
  } catch {
    void notifyTask()
  }

  return { kind: 'ok', leadId: id, createdAt }
}

/**
 * Throws the `errors.rateLimited()` ApiError when the rate-limit branch
 * triggers — used by the REST handler so the 429 surface is consistent.
 * The Server Action prefers the `{ kind: 'rate_limited' }` outcome so
 * the form UI can show a friendly message.
 */
export function throwIfRateLimited(outcome: CreateInterestLeadOutcome) {
  if (outcome.kind === 'rate_limited') {
    throw errors.rateLimited(
      'Trop de demandes depuis ce numéro. Réessaie dans une heure.',
    )
  }
  return outcome
}
