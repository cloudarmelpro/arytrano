import { NextResponse } from 'next/server'
import { unsubscribeNewsletterByToken } from '@/features/newsletter/services/unsubscribe-by-token'

/**
 * Code-review 2026-07-16 — RFC 8058 One-Click unsubscribe. Gmail/
 * Yahoo POST here from the `List-Unsubscribe` header so the mail
 * client's built-in Unsubscribe button works without opening a
 * browser tab. Always returns 200 (idempotent, doesn't leak whether
 * the token exists).
 *
 * Deliberately POST-only: earlier design used a GET page.tsx that
 * mutated on render, which SafeLinks / Mimecast / corporate AV
 * would silently trigger by prefetching every URL in the email.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  await unsubscribeNewsletterByToken(token)
  return new NextResponse(null, { status: 200 })
}
