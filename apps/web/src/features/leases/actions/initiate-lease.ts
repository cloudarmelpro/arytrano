'use server'

import { ZodError } from 'zod'
import { zodIssuesToFields } from '@/lib/forms/zod-fields'
import { rateLimiters } from '@/lib/rate-limit'
import { auth } from '@/features/auth'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { initiateLease } from '../services/initiate-lease'
import { initiateLeaseInputSchema } from '../schemas/lease-input'

export type InitiateLeaseActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
  /** Returned on success — used by the client to redirect to GoalPay checkout. */
  checkoutUrl?: string
  leaseId?: string
}

export async function initiateLeaseAction(
  _prev: InitiateLeaseActionState,
  formData: FormData,
): Promise<InitiateLeaseActionState> {
  // A6 audit fix — translate all user-visible messages using the
  // visitor's locale (cookie-driven via getLocale).
  const locale = await getLocale()
  const t = getT(locale)

  // Auth: must be logged in OWNER (or ADMIN for support flows)
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: t('lease.error.notAuthenticated') }
  }
  if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
    return { ok: false, message: t('lease.error.ownerOnly') }
  }

  // L5 audit fix — rate-limit hijacked-session abuse and runaway retry
  // loops. Each call writes DB rows AND hits GoalPay outbound.
  const rl = await rateLimiters.initiateLease(session.user.id)
  if (!rl.success) {
    return { ok: false, message: t('lease.error.rateLimit') }
  }

  // Parse input from FormData. We coerce numbers + dates here so the Zod
  // schema can stay strict typed (`z.number().int()`, `z.coerce.date()`).
  let input
  try {
    // H2 audit fix: caution is derived server-side in `initiate-lease.ts`
    // from the listing's `cautionMonths` × `priceMonthlyMGA`, so the
    // wizard never sends a separate `cautionMGA` field.
    input = initiateLeaseInputSchema.parse({
      listingId: formData.get('listingId'),
      tenantEmail: formData.get('tenantEmail'),
      monthlyRentMGA: Number(formData.get('monthlyRentMGA') ?? 0),
      startDate: formData.get('startDate'),
      durationMonths: Number(formData.get('durationMonths') ?? 0),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        ok: false,
        message: t('lease.error.invalidFields'),
        fields: zodIssuesToFields(err),
      }
    }
    throw err
  }

  const result = await initiateLease(session.user.id, input)

  switch (result.kind) {
    case 'ok':
      // Don't redirect server-side — the client needs the checkoutUrl
      // to navigate to GoalPay's hosted checkout. We return it and let
      // the form submit handler do `window.location.href = url`.
      return {
        ok: true,
        checkoutUrl: result.checkoutUrl,
        leaseId: result.leaseId,
      }
    case 'listing_not_found':
      return { ok: false, message: t('lease.error.listingNotFound') }
    case 'listing_not_owned':
      return { ok: false, message: t('lease.error.listingNotOwned') }
    case 'listing_not_rentable':
      return {
        ok: false,
        message: t('lease.error.listingNotRentable', {
          status: result.currentStatus,
        }),
      }
    case 'tenant_not_found':
      return {
        ok: false,
        fields: {
          tenantEmail: [t('lease.error.tenantNotFound')],
        },
      }
    case 'tenant_is_owner':
      return {
        ok: false,
        fields: { tenantEmail: [t('lease.error.tenantIsOwner')] },
      }
    case 'existing_lease':
      return {
        ok: false,
        message: t('lease.error.existingLease', { status: result.status }),
      }
    case 'validation_failed':
      return {
        ok: false,
        message: t('lease.error.invalidFields'),
        fields: Object.fromEntries(
          result.issues.map((i) => [i.path, [i.message]]),
        ),
      }
  }
}

// H3 audit fix — removed the `initiateLeaseAndRedirect` no-JS fallback.
// It would silently swallow validation errors on the redirect path
// (no UI to render the issues). The wizard now requires JS (LeaseWizard
// is a client component anyway). If a no-JS flow is needed later, the
// proper shape is to redirect to /dashboard/leases/error?msg=... and
// render the issues on a server-rendered page.
