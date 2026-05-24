'use server'

import { requireAdmin } from '@/features/admin/server'
import { buildSubscribersCsv } from '../services/build-subscribers-csv'

type ExportResult =
  | { ok: true; csv: string; filename: string; count: number }
  | { ok: false; message: string }

/**
 * Admin-only export of WhatsApp Alert subscribers to a CSV string.
 *
 * The Client component triggers a Blob download from the returned
 * string. We don't stream a `Response` here because Server Actions
 * are RPCs (JSON body), not arbitrary HTTP — but a few hundred KB
 * of CSV is trivially small to ship as a JSON-encoded string.
 *
 * Filename uses ISO date so the admin can collect daily snapshots
 * without overwriting (and so the file sorts naturally in any UI).
 */
export async function exportSubscribersCsvAction(input: {
  ids?: string[]
  quartierSlug?: string
  locale?: string
}): Promise<ExportResult> {
  await requireAdmin()

  try {
    const csv = await buildSubscribersCsv({
      ids: input.ids,
      quartierSlug: input.quartierSlug,
      locale: input.locale,
    })
    // Count rows (subtract the BOM-prefixed header line + handle empty body).
    const lines = csv.split('\r\n').filter(Boolean)
    const count = Math.max(0, lines.length - 1)
    const today = new Date().toISOString().slice(0, 10)
    return {
      ok: true,
      csv,
      filename: `arytrano-whatsapp-subscribers-${today}.csv`,
      count,
    }
  } catch {
    return { ok: false, message: 'Export impossible. Réessaie.' }
  }
}
