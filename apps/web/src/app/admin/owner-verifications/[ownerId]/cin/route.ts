import { NextResponse } from 'next/server'
import { auth } from '@/features/auth'
import { requireAdmin, decryptOwnerCin } from '@/features/admin/server'
import { ApiError } from '@/lib/api/errors'

type Ctx = { params: Promise<{ ownerId: string }> }

/**
 * Admin-only CIN viewer (T-039). Decrypts the encrypted CIN on the fly
 * and streams the bytes back with the original Content-Type. No download
 * attachment header — viewer-only. Each call logs a `[cin-access]` line
 * (placeholder for the audit table planned in legal-cin-compliance.md §6).
 *
 * GET /admin/owner-verifications/:ownerId/cin
 */
export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401 },
    )
  }

  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.code }, { status: err.status })
    }
    throw err
  }

  const { ownerId } = await ctx.params
  const decrypted = await decryptOwnerCin({ adminId: admin.userId, ownerId })
  if (!decrypted) {
    return NextResponse.json(
      { error: 'not_found' },
      { status: 404 },
    )
  }

  return new NextResponse(new Uint8Array(decrypted.bytes), {
    headers: {
      'Content-Type': decrypted.mimeType,
      // Never cache — every fetch should re-decrypt + re-log.
      'Cache-Control': 'no-store, max-age=0',
      // Defense in depth: block embedding outside the admin app.
      'X-Frame-Options': 'DENY',
      // The bytes are PII — strongly hint to the browser not to disclose
      // the referrer when the admin clicks a link from this page.
      'Referrer-Policy': 'no-referrer',
    },
  })
}
