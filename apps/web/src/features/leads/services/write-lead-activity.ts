import 'server-only'
import type { Prisma, PrismaClient } from '@prisma/client'
import type { LeadActivityType, LeadActorRole } from '@prisma/client'

/**
 * Append a LeadActivity row. Append-only by design (no update path) —
 * the operator dashboard renders activities as a chronological
 * timeline + the E-T27 dispute path consumes them as evidence.
 *
 * Accepts EITHER `prisma` or a transaction client (`tx`) so callers can
 * thread it through a `$transaction` callback without leaking another
 * Prisma client.
 *
 * NEVER include raw PII in `payload` — the tenant phone is already on
 * LeadRequest, the operator-side messaging summary is the only thing
 * worth persisting here. Anything sensitive should reference the
 * LeadRequest via `leadId` and be looked up at render time.
 */
export async function writeLeadActivity(
  db: PrismaClient | Prisma.TransactionClient,
  input: {
    leadId: string
    type: LeadActivityType
    actorRole: LeadActorRole
    actorUserId?: string | null
    payload?: Record<string, unknown>
  },
) {
  return db.leadActivity.create({
    data: {
      leadId: input.leadId,
      type: input.type,
      actorRole: input.actorRole,
      actorUserId: input.actorUserId ?? null,
      payload: (input.payload ?? {}) as Prisma.InputJsonValue,
    },
    select: { id: true, createdAt: true },
  })
}
