/**
 * E-T28 T-RES-04 — POST /api/v1/leads/:id/claim
 *
 * ADMIN bearer required. Server-enforced WIP cap = 6.
 */
import { makeClaimLeadHandler } from '@/features/leads/api/claim'

export const POST = makeClaimLeadHandler()
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
