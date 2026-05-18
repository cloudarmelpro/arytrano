'use server'

import { headers } from 'next/headers'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { auth } from '@/features/auth'
import { createReport } from '../services/create-report'
import { createReportSchema } from '../schemas/create-report'

type SubmitReportState = {
  ok: boolean
  message?: string
}

/**
 * Visitor submits a report against a public listing (T-025).
 * Generic error message on every failure path (anti-enumeration) — detailed
 * reasons stay in `console.warn` server-side.
 */
export async function submitReportAction(
  _prev: SubmitReportState,
  formData: FormData,
): Promise<SubmitReportState> {
  const GENERIC_ERROR = 'Impossible d\'envoyer le signalement pour le moment.'

  let input
  try {
    input = createReportSchema.parse({
      listingId: formData.get('listingId'),
      reason: formData.get('reason'),
      details: formData.get('details') ?? undefined,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      console.warn('[submitReportAction] validation', { issues: err.issues.length })
      return { ok: false, message: GENERIC_ERROR }
    }
    throw err
  }

  // Rate limit: 10/h/IP + 3/h/(IP, listing). Fail-CLOSED on null IP so a
  // direct connection (no x-forwarded-for) can't bypass the cap. In prod we
  // always have an IP from Vercel/Cloudflare; dev / curl direct gets bucketed
  // under a per-listing synthetic key so legitimate test traffic still works.
  const h = await headers()
  const { ipHash } = extractRequestInfo(h)
  const rateLimitKey = ipHash ?? `noip:${input.listingId}`
  const rl = await rateLimiters.report(rateLimitKey, input.listingId)
  if (!rl.success) {
    return {
      ok: false,
      message: 'Trop de signalements envoyés. Réessaie dans une heure.',
    }
  }

  // Capture reporterId if user is signed in — anonymous reports stay null.
  const session = await auth()
  const reporterId = session?.user?.id ?? null

  try {
    await createReport({
      listingId: input.listingId,
      reason: input.reason,
      details: input.details ?? null,
      reporterId,
    })
    return { ok: true, message: 'Merci, ton signalement a été enregistré.' }
  } catch (err) {
    if (err instanceof ApiError) {
      console.warn('[submitReportAction]', { code: err.code, listingId: input.listingId })
      return { ok: false, message: GENERIC_ERROR }
    }
    console.error('[submitReportAction]', err)
    return { ok: false, message: GENERIC_ERROR }
  }
}
