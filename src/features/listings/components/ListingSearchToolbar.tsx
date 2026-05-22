'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { useT } from '@/lib/i18n/client'
import { NeighborhoodAutocomplete } from './NeighborhoodAutocomplete'
import { ListingSort } from './ListingSort'

type Neighborhood = { slug: string; nameFr: string }

/**
 * Top toolbar above the listings grid — primary search (neighborhood
 * autocomplete) on the left, sort selector on the right.
 *
 * The neighborhood is the most-used filter, so it gets prime real
 * estate at the top. Advanced filters (type, price) live in the left
 * sidebar via `<ListingFiltersSidebar>`.
 */
export function ListingSearchToolbar({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const t = useT()
  const [pending, startTransition] = useTransition()

  const currentNeighborhood = params.get('neighborhood') ?? ''
  const [q, setQ] = useState(params.get('q') ?? '')

  function setNeighborhood(slug: string) {
    const next = new URLSearchParams(params.toString())
    if (slug) next.set('neighborhood', slug)
    else next.delete('neighborhood')
    next.delete('cursor')
    const qs = next.toString()
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  // E-T14 full-text submit. Wraps in a `<form onSubmit>` so the
  // visitor can press Enter to commit — no debounced live search
  // (avoids re-fetching as they type a long query).
  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(params.toString())
    const trimmed = q.trim()
    if (trimmed.length >= 2) next.set('q', trimmed)
    else next.delete('q')
    next.delete('cursor')
    const qs = next.toString()
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <form
          role="search"
          onSubmit={submitSearch}
          className="flex flex-1 items-center gap-2 sm:max-w-xs"
          aria-label={t('toolbar.query.label')}
        >
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('toolbar.query.placeholder')}
            disabled={pending}
            minLength={2}
            maxLength={120}
            className="h-9"
          />
        </form>
        <div className="flex flex-1 items-center gap-2 sm:max-w-md">
          <label
            htmlFor="toolbar-neighborhood"
            className="sr-only"
          >
            {t('toolbar.search.label')}
          </label>
          <div className="flex-1">
            <NeighborhoodAutocomplete
              id="toolbar-neighborhood"
              value={currentNeighborhood}
              neighborhoods={neighborhoods}
              disabled={pending}
              onChange={setNeighborhood}
            />
          </div>
        </div>
      </div>

      <ListingSort />
    </div>
  )
}
