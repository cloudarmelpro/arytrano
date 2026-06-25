'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/client'
import { LucideSquareArrowOutUpRight } from 'lucide-react'

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
      className="inline-flex h-9 items-center gap-1.5 rounded-md text-sm font-medium text-foreground underline-offset-4 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
    > 
      <LucideSquareArrowOutUpRight className="h-4 w-4" />
      <span>{t('share.label')}</span>
    </button>
  )
}
