'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCompareStore } from '../hooks/use-compare-store'

/**
 * TEN-01 — sticky bottom bar that appears when the compare store has
 * at least one listing. Wide enough to show the count + "Comparer"
 * link + a Clear button. Hidden until mount to keep SSR clean.
 */
export function CompareFloatingBar() {
  const { ids, mounted, clear } = useCompareStore()
  if (!mounted || ids.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Comparateur d’annonces"
      className="fixed inset-x-0 bottom-4 z-40 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-full border border-border bg-background/95 px-4 py-2 shadow-lg backdrop-blur"
    >
      <div className="flex items-center gap-2 text-sm">
        <span
          aria-hidden
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
        >
          {ids.length}
        </span>
        <span className="text-foreground/85">
          {ids.length === 1 ? 'annonce à comparer' : 'annonces à comparer'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/compare?ids=${encodeURIComponent(ids.join(','))}`}
          className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          Comparer
        </Link>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-foreground/60 hover:text-destructive"
          aria-label="Vider le comparateur"
        >
          Vider
        </button>
      </div>
    </div>
  )
}
