'use client'

import { useMemo, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useT } from '@/lib/i18n/client'

type StatusTab = { value: '' | 'DRAFT' | 'PUBLISHED' | 'UNAVAILABLE' | 'SUSPENDED' | 'DELETED'; label: string }

export function AdminListingsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const t = useT()
  const [pending, startTransition] = useTransition()

  const currentStatus = params.get('status') ?? ''
  const currentQ = params.get('q') ?? ''

  const tabs = useMemo<StatusTab[]>(
    () => [
      { value: '', label: t('admin.listings.filter.status.all') },
      { value: 'DRAFT', label: t('status.DRAFT') },
      { value: 'PUBLISHED', label: t('status.PUBLISHED') },
      { value: 'UNAVAILABLE', label: t('status.UNAVAILABLE') },
      { value: 'SUSPENDED', label: t('status.SUSPENDED') },
      { value: 'DELETED', label: t('status.DELETED') },
    ],
    [t],
  )

  function update(key: 'status' | 'q', value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('cursor')
    const qs = next.toString()
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  function reset() {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }

  const hasFilter = Boolean(currentStatus || currentQ)

  return (
    <div className="flex flex-col gap-4">
      {/* Status filter — buttons row, mirrors /admin/reports tab pattern */}
      <nav
        className="flex flex-wrap gap-2"
        aria-label={t('admin.listings.filter.status')}
      >
        {tabs.map((tab) => {
          const active = currentStatus === tab.value
          return (
            <button
              key={tab.value || 'all'}
              type="button"
              onClick={() => update('status', tab.value)}
              disabled={pending}
              aria-pressed={active}
              className={`inline-flex h-8 cursor-pointer items-center rounded-md px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Search + reset */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          key={`q-${currentQ}`}
          id="admin-filter-q"
          type="search"
          defaultValue={currentQ}
          placeholder={t('admin.listings.search.placeholder')}
          aria-label={t('admin.listings.search.label')}
          onBlur={(e) => update('q', e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              update('q', e.currentTarget.value.trim())
            }
          }}
          disabled={pending}
          className="h-10 sm:max-w-md"
        />

        {hasFilter && (
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={reset}
            disabled={pending}
          >
            {t('filters.reset')}
          </Button>
        )}
      </div>
    </div>
  )
}
