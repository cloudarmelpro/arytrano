import { NextResponse } from 'next/server'
import { requireAdmin } from '@/features/admin/services/require-admin'
import { buildMonthlyStatsCsv } from '@/features/admin/services/monthly-stats-csv'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * ADM-09 — CSV download endpoint. Auth-gated to admins; auto-suggests
 * a filename with today's date so an admin dropping the file into
 * a spreadsheet keeps history straight.
 */
export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const csv = await buildMonthlyStatsCsv()
  const today = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="arytrano-stats-${today}.csv"`,
      'cache-control': 'no-store',
    },
  })
}
