'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/client'

/**
 * Share button — uses the Web Share API on mobile (native share sheet:
 * WhatsApp, Messenger, SMS, mail…) and falls back to clipboard on desktop
 * where Web Share is rarely implemented.
 */
export function ShareButton({ title }: { title: string }) {
  const t = useT()
  const [busy, setBusy] = useState(false)

  async function onClick() {
    if (busy) return
    setBusy(true)
    try {
      const url = window.location.href
      // Web Share is mobile-first — when present, it covers SMS, WA, mail,
      // copy-to-clipboard, all from one native sheet.
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title, url })
          return
        } catch (err) {
          // User-cancelled (`AbortError`) is silent. Other failures fall
          // through to clipboard so they still get something.
          if ((err as { name?: string })?.name === 'AbortError') return
        }
      }
      await navigator.clipboard.writeText(url)
      toast.success(t('share.copied'))
    } catch {
      toast.error(t('share.failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={t('share.aria')}
      className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-foreground underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      <span>{t('share.label')}</span>
    </button>
  )
}
