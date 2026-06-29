'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * EDT-18 / LEG-06 — RGPD-style cookie consent banner.
 *
 * Home-grown (no third-party — no CMP fees, no extra script bundle).
 * Only essential cookies are loaded by default; the only "consent"
 * gated feature today is reCAPTCHA + future analytics, so the choice
 * is effectively accept-or-decline at the JS-loaded-tier level.
 *
 * Persistence: localStorage key `arytrano-cookie-consent` =
 *   - `accepted` → user opted in to optional cookies
 *   - `rejected` → user opted out
 * No value = banner shows.
 *
 * SSR safety: render nothing until after mount so the server bundle
 * doesn't inject a banner that may flicker for users who already
 * consented (the banner has SSR no way to know localStorage state).
 */
const STORAGE_KEY = 'arytrano-cookie-consent'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored !== 'accepted' && stored !== 'rejected') {
        setVisible(true)
      }
    } catch {
      // Private mode / blocked storage — show the banner anyway, the
      // user can still dismiss it for the session.
      setVisible(true)
    }
  }, [])

  function decide(choice: 'accepted' | 'rejected') {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice)
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Bandeau de consentement aux cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 shadow-2xl backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
        <div className="flex-1 text-sm text-foreground/80">
          <p className="font-medium text-foreground">
            AryTrano utilise des cookies essentiels pour fonctionner.
          </p>
          <p className="mt-1 text-foreground/70">
            Avec ton accord, on utilise aussi des cookies de mesure
            d’audience et un anti-bot (reCAPTCHA) pour améliorer le site.{' '}
            <Link
              href="/legal/cookies"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              En savoir plus
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => decide('rejected')}
          >
            Refuser
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => decide('accepted')}
          >
            Accepter
          </Button>
        </div>
      </div>
    </div>
  )
}
