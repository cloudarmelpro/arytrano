'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useT } from '@/lib/i18n/client'

const SORT_OPTIONS = ['newest', 'price-asc', 'price-desc'] as const
type SortValue = (typeof SORT_OPTIONS)[number]

/**
 * Minimalist flat sort selector — plain text buttons with an underline
 * marking the active option (Spotify / Apple Music style). No boxes,
 * no icons, no arrows. Reads / writes the `sort` query param.
 */
export function ListingSort() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const t = useT()
  const [pending, startTransition] = useTransition()

  const current: SortValue =
    (SORT_OPTIONS.find((s) => s === params.get('sort')) as SortValue | undefined) ??
    'newest'

  function onChange(next: SortValue) {
    const qs = new URLSearchParams(params.toString())
    if (next !== 'newest') qs.set('sort', next)
    else qs.delete('sort')
    qs.delete('cursor') // sort change resets pagination
    const s = qs.toString()
    startTransition(() => {
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false })
    })
  }

  return (
    <div
      className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm"
      aria-busy={pending}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {t('sort.byLabel')}
      </span>
      <SortLink current={current} value="newest" onChange={onChange} disabled={pending}>
        {t('sort.newest')}
      </SortLink>
      <SortLink current={current} value="price-asc" onChange={onChange} disabled={pending}>
        {t('sort.priceAsc')}
      </SortLink>
      <SortLink current={current} value="price-desc" onChange={onChange} disabled={pending}>
        {t('sort.priceDesc')}
      </SortLink>
    </div>
  )
}

function SortLink({
  current,
  value,
  onChange,
  disabled,
  children,
}: {
  current: SortValue
  value: SortValue
  onChange: (v: SortValue) => void
  disabled: boolean
  children: React.ReactNode
}) {
  const active = current === value
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex h-8 cursor-pointer items-center rounded-md px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
