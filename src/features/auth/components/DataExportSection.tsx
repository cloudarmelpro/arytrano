'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import { exportMyDataAction } from '../actions/export-my-data'

/**
 * RGPD "Download my data" section (T-052) for /dashboard/settings.
 * Calls the Server Action, gets back a JSON string + filename, and
 * triggers a Blob download client-side.
 *
 * Rate limit is 1/h per user — generous enough for any legitimate
 * audit and tight enough to bound abuse. Errors surface as toast.
 */
export function DataExportSection() {
  const t = useT()
  const [pending, startTransition] = useTransition()

  function downloadJson(json: string, filename: string) {
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function handleClick() {
    startTransition(async () => {
      const res = await exportMyDataAction()
      if (res.ok) {
        downloadJson(res.json, res.filename)
        toast.success(t('settings.dataExport.success'))
      } else if (res.needsAuth) {
        toast.error(t('settings.dataExport.needsAuth'))
      } else if (res.rateLimited) {
        toast.error(t('settings.dataExport.rateLimit'))
      } else {
        toast.error(res.message ?? t('settings.dataExport.error'))
      }
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-muted/40 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <p className="text-[15px] font-semibold text-foreground">
          {t('settings.dataExport.label')}
        </p>
        <p className="mt-1 text-[13.5px] leading-[1.55] text-foreground/70">
          {t('settings.dataExport.help')}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={pending}
        aria-busy={pending}
        className="shrink-0"
      >
        {pending
          ? t('settings.dataExport.pending')
          : t('settings.dataExport.cta')}
      </Button>
    </div>
  )
}
