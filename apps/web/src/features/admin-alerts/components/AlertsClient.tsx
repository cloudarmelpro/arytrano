'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useT } from '@/lib/i18n/client'
import { exportSubscribersCsvAction } from '../actions/export-subscribers-csv'
import type { AdminAlertRow } from '../queries/list-whatsapp-alerts'

type Props = {
  items: AdminAlertRow[]
  nextCursor: string | null
  hasMore: boolean
  total: number
  filters: { quartierSlug?: string; locale?: string }
  quartierOptions: Array<{ value: string; label: string }>
}

/**
 * Client island of /admin/whatsapp-alerts. The page passes pre-fetched
 * rows + filter values; the client adds :
 *   - Filter <Select>s that drive URL search params (Server Component
 *     re-fetches on navigation — no need to lift state higher)
 *   - Multi-select checkboxes (purely client state)
 *   - "Export CSV" button that calls the Server Action then triggers
 *     a Blob download client-side
 *   - Pagination link respecting current filters
 *
 * Filter state lives in the URL so the admin can bookmark / share a
 * filtered view and refresh stays consistent.
 */
export function AlertsClient({
  items,
  nextCursor,
  hasMore,
  total,
  filters,
  quartierOptions,
}: Props) {
  const t = useT()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allChecked = items.length > 0 && selectedIds.size === items.length
  const someChecked = selectedIds.size > 0 && !allChecked

  function toggleOne(id: string, next: boolean) {
    setSelectedIds((prev) => {
      const copy = new Set(prev)
      if (next) copy.add(id)
      else copy.delete(id)
      return copy
    })
  }

  function toggleAll(next: boolean) {
    if (next) setSelectedIds(new Set(items.map((i) => i.id)))
    else setSelectedIds(new Set())
  }

  function pushFilter(key: 'quartier' | 'locale', value: string) {
    const next = new URLSearchParams(searchParams.toString())
    // Resetting pagination cursor on filter change avoids the "filter
    // applied but you're still on page 5" trap.
    next.delete('cursor')
    if (value) next.set(key, value)
    else next.delete(key)
    router.push(`/admin/whatsapp-alerts?${next.toString()}`)
  }

  function downloadCsv(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function exportAll() {
    startTransition(async () => {
      const res = await exportSubscribersCsvAction({
        quartierSlug: filters.quartierSlug,
        locale: filters.locale,
      })
      if (res.ok) {
        downloadCsv(res.csv, res.filename)
        toast.success(t('admin.alerts.export.success', { count: res.count }))
      } else {
        toast.error(res.message)
      }
    })
  }

  function exportSelected() {
    if (selectedIds.size === 0) return
    startTransition(async () => {
      const res = await exportSubscribersCsvAction({
        ids: Array.from(selectedIds),
      })
      if (res.ok) {
        downloadCsv(res.csv, res.filename)
        toast.success(t('admin.alerts.export.success', { count: res.count }))
      } else {
        toast.error(res.message)
      }
    })
  }

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [],
  )

  // Phone display : keep the +261 prefix but space out the rest so a
  // 12-digit string doesn't render as one long blob. Drop-back to raw
  // if the format doesn't match (defensive).
  function formatPhone(phone: string): string {
    const match = /^\+261(\d{2})(\d{2})(\d{3})(\d{2})$/.exec(phone)
    if (!match) return phone
    return `+261 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field>
          <FieldLabel htmlFor="filter-quartier">
            {t('admin.alerts.filter.quartier')}
          </FieldLabel>
          <Select
            value={filters.quartierSlug ?? ''}
            onValueChange={(v) => pushFilter('quartier', v ?? '')}
            items={[
              { value: '', label: t('admin.alerts.filter.allQuartiers') },
              ...quartierOptions,
            ]}
          >
            <SelectTrigger id="filter-quartier" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t('admin.alerts.filter.allQuartiers')}
              </SelectItem>
              {quartierOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-locale">
            {t('admin.alerts.filter.locale')}
          </FieldLabel>
          <Select
            value={filters.locale ?? ''}
            onValueChange={(v) => pushFilter('locale', v ?? '')}
            items={[
              { value: '', label: t('admin.alerts.filter.allLocales') },
              { value: 'fr-MG', label: 'Français' },
              { value: 'mg', label: 'Malagasy' },
            ]}
          >
            <SelectTrigger id="filter-locale" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t('admin.alerts.filter.allLocales')}
              </SelectItem>
              <SelectItem value="fr-MG">Français</SelectItem>
              <SelectItem value="mg">Malagasy</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Button
          type="button"
          onClick={exportAll}
          disabled={pending || total === 0}
          aria-busy={pending}
          className="h-10"
        >
          {t('admin.alerts.export.all', { count: total })}
        </Button>
      </div>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-primary/5 px-4 py-3">
          <span className="text-sm text-foreground">
            {t('admin.alerts.selectedCount', { count: selectedIds.size })}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              {t('admin.alerts.selection.clear')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={exportSelected}
              disabled={pending}
              aria-busy={pending}
            >
              {t('admin.alerts.export.selected')}
            </Button>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-12 text-center text-sm text-muted-foreground">
          {t('admin.alerts.empty')}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-[12px] uppercase tracking-[0.05em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked
                    }}
                    onChange={(e) => toggleAll(e.target.checked)}
                    aria-label={t('admin.alerts.selection.toggleAll')}
                    className="h-4 w-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">{t('admin.alerts.col.phone')}</th>
                <th className="px-4 py-3">{t('admin.alerts.col.locale')}</th>
                <th className="px-4 py-3">{t('admin.alerts.col.quartier')}</th>
                <th className="px-4 py-3">{t('admin.alerts.col.signedUp')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => {
                const checked = selectedIds.has(row.id)
                return (
                  <tr
                    key={row.id}
                    className={checked ? 'bg-primary/5' : 'hover:bg-muted/40'}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleOne(row.id, e.target.checked)}
                        aria-label={t('admin.alerts.selection.toggleOne')}
                        className="h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px]">
                      {formatPhone(row.phoneE164)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">
                      {row.locale === 'mg' ? 'Malagasy' : 'Français'}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {row.quartierSlug ?? (
                        <span className="text-muted-foreground italic">
                          {t('admin.alerts.col.anyQuartier')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12.5px] text-muted-foreground">
                      {dateFmt.format(row.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && nextCursor ? (
        <nav className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const next = new URLSearchParams(searchParams.toString())
              next.set('cursor', nextCursor)
              router.push(`/admin/whatsapp-alerts?${next.toString()}`)
              // Pagination resets selection — different rows wouldn't
              // be visible to confirm, and the export filter ignores
              // selection state across page navigations.
              setSelectedIds(new Set())
            }}
          >
            {t('admin.alerts.next')}
          </Button>
        </nav>
      ) : null}
    </div>
  )
}
