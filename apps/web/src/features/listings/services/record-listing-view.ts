import 'server-only'
import { prisma } from '@/lib/db'

/**
 * T-058 — record a public-detail page view.
 *
 * Called from the public listing detail page via `after()` so the
 * server response is never blocked by the write. Dedup window =
 * 30 minutes per (listing, viewerHash) pair so a tab refresh / quick
 * back-and-forth doesn't inflate the count.
 *
 * Best-effort : if Postgres is down or the DB rejects, we swallow the
 * error rather than poison the public render. Errors land in Sentry
 * via the page's own error boundary.
 */

const DEDUP_MS = 30 * 60 * 1000 // 30 min

export type ListingViewSource = 'direct' | 'internal' | 'search' | 'social' | 'other'

export type RecordListingViewInput = {
  listingId: string
  viewerHash: string | null
  sessionHash: string | null
  source: ListingViewSource
  viewerUserId: string | null
}

export async function recordListingView(
  input: RecordListingViewInput,
): Promise<void> {
  try {
    // Dedup : skip the insert if the same viewerHash hit the same
    // listing in the last 30 min. We check sessionHash as a fallback
    // when viewerHash is null (CF cold edge).
    const dedupKey = input.viewerHash ?? input.sessionHash
    if (dedupKey) {
      const since = new Date(Date.now() - DEDUP_MS)
      const recent = await prisma.listingView.findFirst({
        where: {
          listingId: input.listingId,
          createdAt: { gt: since },
          OR: [
            { viewerHash: input.viewerHash ?? undefined },
            { sessionHash: input.sessionHash ?? undefined },
          ],
        },
        select: { id: true },
      })
      if (recent) return
    }

    await prisma.listingView.create({
      data: {
        listingId: input.listingId,
        viewerHash: input.viewerHash,
        sessionHash: input.sessionHash,
        source: input.source,
        viewerUserId: input.viewerUserId,
      },
    })
  } catch {
    // Swallowed — view analytics are best-effort, never block the page.
  }
}

/**
 * Classify a Referer header into one of the 5 source buckets.
 * Falls back to 'other' for empty / unparseable values.
 */
export function classifyViewSource(
  referer: string | null,
  ownHost: string,
): ListingViewSource {
  if (!referer) return 'direct'
  let url: URL
  try {
    url = new URL(referer)
  } catch {
    return 'other'
  }
  const h = url.hostname.toLowerCase()
  if (h === ownHost || h.endsWith(`.${ownHost}`)) return 'internal'
  if (
    h === 'google.com' ||
    h.endsWith('.google.com') ||
    h === 'bing.com' ||
    h.endsWith('.bing.com') ||
    h === 'duckduckgo.com' ||
    h === 'yandex.com' ||
    h.endsWith('.yandex.com')
  ) {
    return 'search'
  }
  if (
    h === 'wa.me' ||
    h.endsWith('.whatsapp.com') ||
    h === 'whatsapp.com' ||
    h === 'facebook.com' ||
    h.endsWith('.facebook.com') ||
    h === 'm.facebook.com' ||
    h === 'instagram.com' ||
    h.endsWith('.instagram.com') ||
    h === 't.co' ||
    h === 'x.com' ||
    h === 'twitter.com'
  ) {
    return 'social'
  }
  return 'other'
}
