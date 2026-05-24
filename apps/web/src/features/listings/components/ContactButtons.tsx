'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import { revealContactAction } from '../actions/contact'

type Channel = 'WHATSAPP' | 'PHONE'

/**
 * Two-button reveal-on-click contact for the public listing detail page.
 *
 * - Phone is NEVER rendered server-side (anti-scraping). The first click
 *   triggers a Server Action that records a ContactEvent (T-019) and
 *   returns the phone in E.164 digits format.
 * - Subsequent clicks on the same channel skip the round-trip — we keep
 *   the revealed phone in client state and immediately open `wa.me` / `tel:`.
 * - We still log the event on EVERY click so the owner sees real interest
 *   volume, not just unique visitors. The action returns the same phone.
 */
export function ContactButtons({
  listingId,
  hasPhone,
}: {
  listingId: string
  /** Owner has a phone on file — hide buttons entirely if false. */
  hasPhone: boolean
}) {
  const t = useT()
  const [pending, startTransition] = useTransition()
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)

  if (!hasPhone) {
    return (
      <div className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">{t('contact.noPhone')}</p>
      </div>
    )
  }

  function handleClick(channel: Channel) {
    setActiveChannel(channel)
    startTransition(async () => {
      const result = await revealContactAction(listingId, channel)
      if (!result.ok || !result.phoneE164) {
        toast.error(result.message ?? t('contact.error.generic'))
        setActiveChannel(null)
        return
      }
      const url =
        channel === 'WHATSAPP'
          ? `https://wa.me/${result.phoneE164}`
          : `tel:+${result.phoneE164}`
      // open in new tab for WhatsApp (browser → web/app), same tab for tel:
      if (channel === 'WHATSAPP') {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = url
      }
      setActiveChannel(null)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="default"
        size="lg"
        onClick={() => handleClick('WHATSAPP')}
        disabled={pending}
        aria-busy={pending && activeChannel === 'WHATSAPP'}
        aria-label={t('contact.aria.whatsapp')}
        className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5a] inline-flex items-center justify-center gap-2"
      >
        {pending && activeChannel === 'WHATSAPP' ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.768.967-.94 1.164-.174.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.04 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
        )}
        {t('contact.whatsapp')}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => handleClick('PHONE')}
        disabled={pending}
        aria-busy={pending && activeChannel === 'PHONE'}
        aria-label={t('contact.aria.call')}
        className="w-full inline-flex items-center justify-center gap-2"
      >
        {pending && activeChannel === 'PHONE' ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" aria-hidden />
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
          </svg>
        )}
        {t('contact.call')}
      </Button>

      <p className="text-center text-xs text-muted-foreground">{t('contact.hint')}</p>
    </div>
  )
}
