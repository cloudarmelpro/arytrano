'use server'

import { auth } from '../auth'
import { rateLimiters } from '@/lib/rate-limit'
import { exportUserData } from '../services/export-user-data'

type ExportResult =
  | { ok: true; json: string; filename: string }
  | { ok: false; needsAuth?: boolean; rateLimited?: boolean; message?: string }

/**
 * Owner-only RGPD data export (T-052). Returns the JSON string for
 * the client to download as a Blob. Action is rate-limited 1/h per
 * userId — a legitimate audit doesn't need more, and the upper bound
 * caps abuse if a stolen token tries to scrape the full payload.
 *
 * No CSV here — the data has nested arrays (listings, reviews,
 * favorites…) that flatten poorly. JSON is the right format for an
 * RGPD export and is human-readable.
 */
export async function exportMyDataAction(): Promise<ExportResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, needsAuth: true }
  }

  const rl = await rateLimiters.exportUserData(session.user.id)
  if (!rl.success) {
    return { ok: false, rateLimited: true }
  }

  try {
    const data = await exportUserData(session.user.id)
    const json = JSON.stringify(data, null, 2)
    const today = new Date().toISOString().slice(0, 10)
    return {
      ok: true,
      json,
      filename: `arytrano-mes-donnees-${today}.json`,
    }
  } catch {
    return { ok: false, message: 'Export impossible. Réessaie plus tard.' }
  }
}
