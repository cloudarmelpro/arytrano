'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/client'
import { useUrlFilters } from '@/lib/hooks/use-url-filters'
import { Icon } from '@/components/shared/Icon'

/**
 * Slim toolbar — keyword search input only. The sort selector moved
 * to the results bar (next to "Save search") so this row stays
 * focused on a single affordance.
 */
export function UnifiedToolbar() {
  const { params, pending, updateParam } = useUrlFilters()
  const t = useT()

  const [q, setQ] = useState(params.get('q') ?? '')

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = q.trim()
    updateParam('q', trimmed.length >= 2 ? trimmed : null)
  }

  return (
    <form
      role="search"
      onSubmit={submitSearch}
      aria-label={t('toolbar.query.label')}
      aria-busy={pending}
      className="mb-6 flex items-center gap-2.5 rounded-2xl border border-border bg-background px-4 py-2"
    >
      <Icon name="search" size={16} className="text-muted-foreground" />
      <input
        id="toolbar-query"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label={t('toolbar.query.label')}
        placeholder={t('toolbar.query.placeholder')}
        disabled={pending}
        minLength={2}
        maxLength={120}
        className="h-9 flex-1 border-none bg-transparent text-[14px] outline-none placeholder:text-muted-foreground disabled:opacity-50"
      />
    </form>
  )
}
