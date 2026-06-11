/**
 * E-T28 T-RES-04 — POST /api/v1/leads/:id/link-lease
 *
 * ADMIN bearer required. Body : { leaseId }.
 */
import { makeLinkLeadLeaseHandler } from '@/features/leads/api/link-lease'

export const POST = makeLinkLeadLeaseHandler()
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
