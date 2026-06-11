/**
 * E-T28 T-RES-04 — POST /api/v1/leads/:id/transition
 *
 * ADMIN bearer required. Body : { nextStatus, note?, channel? }.
 */
import { makeTransitionLeadHandler } from '@/features/leads/api/transition'

export const POST = makeTransitionLeadHandler()
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
