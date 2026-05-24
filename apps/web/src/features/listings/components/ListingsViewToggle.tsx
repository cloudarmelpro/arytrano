'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useT } from '@/lib/i18n/client'

/**
 * Grid ↔ Map toggle for /annonces (E-T10).
 *
 * Persists the choice in the URL (`?view=map`) so the back-button +
 * share-link both work. Default (no `?view=` param) stays grid — keeps
 * the SEO-friendly server-rendered listing cards as the indexable
 * default content of /annonces.
 */
export function ListingsViewToggle({ view }: { view: 'grid' | 'map' }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const t = useT()
  const [pending, startTransition] = useTransition()

  function switchTo(next: 'grid' | 'map') {
    if (next === view) return
    const sp = new URLSearchParams(params.toString())
    if (next === 'map') sp.set('view', 'map')
    else sp.delete('view')
    // The map shows ALL matching listings — drop cursor so we don't
    // strand the user on page 2 when toggling from a paginated grid.
    sp.delete('cursor')
    const qs = sp.toString()
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  // A11y — earlier this used role="tablist"/role="tab" but that ARIA
  // pattern mandates arrow-key navigation between tabs. The grid/map
  // toggle is conceptually a pair of toggle buttons (only one active),
  // which the `aria-pressed` pattern covers cleanly with no extra
  // keyboard logic — each button stays in the Tab order naturally.
  return (
    <div
      role="group"
      aria-label={t('toolbar.view.label')}
      className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background p-1"
    >
      <button
        type="button"
        aria-pressed={view === 'grid'}
        disabled={pending}
        onClick={() => switchTo('grid')}
        className={`inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-[12.5px] font-medium transition ${
          view === 'grid'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <svg
          aria-hidden="true"
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        {t('toolbar.view.grid')}
      </button>
      <button
        type="button"
        aria-pressed={view === 'map'}
        disabled={pending}
        onClick={() => switchTo('map')}
        className={`inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-[12.5px] font-medium transition ${
          view === 'map'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <svg
          aria-hidden="true"
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
          <path d="M9 3v15" />
          <path d="M15 6v15" />
        </svg>
        {t('toolbar.view.map')}
      </button>
    </div>
  )
}
