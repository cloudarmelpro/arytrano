'use client'

import { useMemo } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { useT } from '@/lib/i18n/client'

type Neighborhood = { slug: string; nameFr: string }

type Item = { value: string; label: string }

/**
 * T-015 — neighborhood autocomplete for the public listings search.
 * Wraps Base UI Combobox. Client-side filtering is fine for v0 since
 * Fianarantsoa has a small, seeded set of neighborhoods. If the dataset
 * grows (multi-city in v1), switch to server-side query through a
 * Server Action keyed by city slug.
 */
export function NeighborhoodAutocomplete({
  id,
  value,
  neighborhoods,
  disabled,
  onChange,
}: {
  id: string
  value: string
  neighborhoods: Neighborhood[]
  disabled?: boolean
  onChange: (slug: string) => void
}) {
  const t = useT()

  const items = useMemo<Item[]>(
    () => neighborhoods.map((n) => ({ value: n.slug, label: n.nameFr })),
    [neighborhoods],
  )

  // Object.is comparison default — we MUST hand Combobox the exact
  // reference from `items` rather than a fresh `{value,label}` literal.
  const selected = useMemo<Item | null>(
    () => items.find((it) => it.value === value) ?? null,
    [items, value],
  )

  return (
    <Combobox.Root<Item>
      items={items}
      value={selected}
      onValueChange={(next) => onChange(next?.value ?? '')}
      autoHighlight
    >
      <div className="relative">
        <Combobox.Input
          id={id}
          placeholder={t('filters.neighborhood.search')}
          disabled={disabled}
          className="h-10 w-full rounded-md border border-input bg-background px-3 pr-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        />
        {selected && (
          <Combobox.Clear
            aria-label={t('filters.neighborhood.clear')}
            disabled={disabled}
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden>×</span>
          </Combobox.Clear>
        )}
      </div>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} className="z-50 outline-none">
          <Combobox.Popup className="max-h-72 w-[var(--anchor-width)] overflow-auto rounded-md border border-border bg-popover py-1 text-sm shadow-lg outline-none">
            <Combobox.Empty className="px-3 py-2 text-muted-foreground">
              {t('filters.neighborhood.empty')}
            </Combobox.Empty>
            <Combobox.List>
              {items.map((it) => (
                <Combobox.Item
                  key={it.value}
                  value={it}
                  className="flex cursor-pointer select-none items-center px-3 py-2 outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-selected:font-medium"
                >
                  {it.label}
                </Combobox.Item>
              ))}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}
