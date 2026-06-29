import 'server-only'
import { headers } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { extractRequestInfo } from '@/lib/auth/request-info'

/**
 * TRU-09 / ADM-05 — append-only writer for the admin audit trail.
 *
 * Call from any privileged admin Server Action AFTER the business
 * operation succeeds. Failures here are SWALLOWED (Sentry-captured)
 * so a transient DB hiccup never prevents the user-facing action
 * from completing. The audit row is best-effort observability, not
 * a transactional invariant.
 *
 * Pre-condition: caller has already verified the actor is an admin
 * (via `requireAdmin()`). This helper doesn't re-check role.
 */
export type WriteAuditLogInput = {
  adminId: string
  /** Dotted lowercase verb, e.g. "listing.verify". */
  action: string
  /** Domain entity name in PascalCase, e.g. "Listing". */
  targetType: string
  targetId: string
  /** Small JSON-serializable context. Keep < 1KB, NO PII. */
  metadata?: Record<string, unknown>
}

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  try {
    const h = await headers()
    const { ipHash } = extractRequestInfo(h)
    await prisma.auditLog.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        metadata: (input.metadata as object | undefined) ?? undefined,
        ipHash,
      },
    })
  } catch (err) {
    Sentry.captureException(err, {
      level: 'warning',
      tags: { kind: 'audit-log-write' },
      extra: { action: input.action, targetType: input.targetType },
    })
  }
}
