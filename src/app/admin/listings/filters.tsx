'use client'

import { useMemo, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useT } from '@/lib/i18n/client'

const STATUSES = ['', 'DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'SUSPENDED', 'DELETED'] as const

export function AdminListingsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const t = useT()
  const [pending, startTransition] = useTransition()

  const currentStatus = params.get('status') ?? ''
  const currentQ = params.get('q') ?? ''

  const statusItems = useMemo(
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
    <div>
      <FieldGroup className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <Field className="sm:w-48">
          <FieldLabel htmlFor="admin-filter-status">
            {t('admin.listings.filter.status')}
          </FieldLabel>
          <Select
            value={currentStatus}
            onValueChange={(v) => update('status', v ?? '')}
            items={statusItems}
            disabled={pending}
          >
            <SelectTrigger id="admin-filter-status" className="h-10 w-full">
              <SelectValue placeholder={t('admin.listings.filter.status.all')} />
            </SelectTrigger>
            <SelectContent>
              {statusItems.map((it) => (
                <SelectItem key={it.value || 'all'} value={it.value}>
                  {it.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field className="flex-1 sm:max-w-md">
          <FieldLabel htmlFor="admin-filter-q">
            {t('admin.listings.search.label')}
          </FieldLabel>
          <Input
            key={`q-${currentQ}`}
            id="admin-filter-q"
            type="search"
            defaultValue={currentQ}
            placeholder={t('admin.listings.search.placeholder')}
            onBlur={(e) => update('q', e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                update('q', e.currentTarget.value.trim())
              }
            }}
            disabled={pending}
            className="h-10"
          />
        </Field>

        {hasFilter && (
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={reset}
            disabled={pending}
            className="self-end"
          >
            {t('filters.reset')}
          </Button>
        )}
      </FieldGroup>
    </div>
  )
}
