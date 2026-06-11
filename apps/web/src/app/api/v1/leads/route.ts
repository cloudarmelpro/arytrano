/**
 * E-T28 T-RES-04 — POST /api/v1/leads
 *
 * Anonymous-friendly: bearer is OPTIONAL. Body shape lives in the
 * leads feature Zod schemas.
 */
export { makeCreateInterestLeadHandler as POST_handler } from '@/features/leads/api/create'

import { makeCreateInterestLeadHandler } from '@/features/leads/api/create'

export const POST = makeCreateInterestLeadHandler()
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
