import 'server-only'
import { prisma } from '@/lib/db'

/**
 * ANA-09 — fire-and-forget tracker called by the /annonces page
 * whenever the visitor typed a non-trivial query. Empty / < 2 char
 * queries are dropped upstream so we don't inflate the table.
 */
export async function recordSearchQuery(input: {
  q: string
  resultCount: number
  ipHash: string | null
}): Promise<void> {
  const normalized = input.q.trim().toLowerCase()
  if (normalized.length < 2 || normalized.length > 120) return
  try {
    await prisma.searchQuery.create({
      data: {
        q: normalized,
        resultCount: input.resultCount,
        ipHash: input.ipHash,
      },
    })
  } catch {
    /* swallow — analytics failures never surface to the user */
  }
}
