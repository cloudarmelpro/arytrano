'use client'

import { toast } from 'sonner'
import { useCompareStore, COMPARE_MAX } from '../hooks/use-compare-store'

/**
 * TEN-01 — small icon button rendered on each listing card.
 * Adds/removes the current listing from the comparator; toasts when
 * the max is reached.
 */
export function CompareToggleButton({
  listingId,
  variant = 'ghost',
}: {
  listingId: string
  variant?: 'ghost' | 'inline'
}) {
  const { ids, toggle, mounted } = useCompareStore()
  if (!mounted) return null
  const active = ids.includes(listingId)

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Retirer du comparateur' : 'Ajouter au comparateur'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const result = toggle(listingId)
        if (result.full) {
          toast.error(`Le comparateur est plein (${COMPARE_MAX} annonces max).`)
        } else if (result.added) {
          toast.success('Ajouté au comparateur.')
        }
      }}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition ${
        variant === 'inline'
          ? 'bg-background/90 text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground'
          : 'text-foreground/60 hover:bg-muted hover:text-foreground'
      } ${active ? '!bg-primary !text-primary-foreground' : ''}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="3" y="4" width="7" height="16" rx="1.5" />
        <rect x="14" y="4" width="7" height="16" rx="1.5" />
      </svg>
    </button>
  )
}
