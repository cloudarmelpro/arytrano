'use client'

import { useT } from '@/lib/i18n/client'
import { useUrlFilters } from '@/lib/hooks/use-url-filters'
import { Button } from '@/components/ui/button'

const SORT_VALUES = ['newest', 'price-asc', 'price-desc'] as const
type SortValue = (typeof SORT_VALUES)[number]

/**
 * Sort toggle row — 3 inline pills (Récents / Prix ↗ / Prix ↘),
 * URL-driven via `?sort=`. Used in the results bar next to the
 * save-search button.
 */
export function ListingSortButtons() {
  const { params, pending, updateParam } = useUrlFilters()
  const t = useT()

  const sortParam = params.get('sort') ?? ''
  const current: SortValue = SORT_VALUES.includes(sortParam as SortValue)
    ? (sortParam as SortValue)
    : 'newest'

  function setSort(next: SortValue) {
    if (next === current) return
    // `newest` is the default — drop the param instead of setting it.
    updateParam('sort', next === 'newest' ? null : next)
  }

  return (
    <div
      role="group"
      aria-label={t('sort.byLabel')}
      className="flex flex-wrap items-center gap-1.5"
    >
      <SortPill
        active={current === 'newest'}
        disabled={pending}
        onClick={() => setSort('newest')}
        label={t('sort.newest.short')}
      />
      <SortPill
        active={current === 'price-asc'}
        disabled={pending}
        onClick={() => setSort('price-asc')}
        label={t('sort.priceAsc.short')}
      />
      <SortPill
        active={current === 'price-desc'}
        disabled={pending}
        onClick={() => setSort('price-desc')}
        label={t('sort.priceDesc.short')}
      />
    </div>
  )
}

function SortPill({
  active,
  disabled,
  onClick,
  label,
}: {
  active: boolean
  disabled: boolean
  onClick: () => void
  label: string
}) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      size="sm"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={
        active
          ? 'border-primary'
          : 'border-border bg-background text-foreground hover:bg-muted'
      }
    >
      {label}
    </Button>
  )
}
