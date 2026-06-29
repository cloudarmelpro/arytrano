'use server'

import { revalidatePath } from 'next/cache'
import { ApiError } from '@/lib/api/errors'
import { writeAuditLog } from '@/lib/audit/write-audit-log'
import { resolveReportSchema } from '../schemas/resolve-report'
import { resolveReport } from '../services/resolve-report'
import { requireAdmin } from '../services/require-admin'

type ResolveReportState = { ok: boolean; message?: string }

/**
 * Server Action wrapper around `resolveReport` (admin moderation).
 * Web-only — the REST API would mount its own handler under
 * `features/admin/api/` calling the same service.
 */
export async function resolveReportAction(
  reportId: string,
  decision: 'RESOLVED' | 'DISMISSED',
  adminNote: string,
): Promise<ResolveReportState> {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    throw err
  }

  const parsed = resolveReportSchema.safeParse({ reportId, decision, adminNote })
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Paramètres invalides',
    }
  }

  try {
    await resolveReport({ data: parsed.data, adminId: admin.userId })
    void writeAuditLog({
      adminId: admin.userId,
      action: parsed.data.decision === 'RESOLVED' ? 'report.resolve' : 'report.dismiss',
      targetType: 'Report',
      targetId: parsed.data.reportId,
      metadata: { adminNote: parsed.data.adminNote.slice(0, 200) },
    })
    revalidatePath('/admin/reports')
    revalidatePath('/admin')
    return { ok: true }
  } catch (err) {
    console.error('[resolveReportAction]', err)
    return { ok: false, message: 'Impossible de mettre à jour le signalement.' }
  }
}
