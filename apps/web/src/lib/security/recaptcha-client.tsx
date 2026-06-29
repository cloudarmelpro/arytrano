'use client'

import { useEffect, useState, useCallback } from 'react'

/**
 * TRU-17 — client-side reCAPTCHA v3 plumbing.
 *
 * `<RecaptchaScript>` injects the Google script tag once per page and
 * only when the public site key is configured. `useRecaptchaToken`
 * returns a function the form calls right before submit to mint a
 * fresh token for a given action label. When the script isn't loaded
 * (no key OR network blocked) the mint returns `null` — the server
 * verifier short-circuits to "ok" in that case so the form still
 * submits.
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

const SCRIPT_ID = 'arytrano-recaptcha-script'

export function RecaptchaScript({ siteKey }: { siteKey: string | undefined }) {
  useEffect(() => {
    if (!siteKey) return
    if (document.getElementById(SCRIPT_ID)) return

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.defer = true
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
    document.head.appendChild(script)
  }, [siteKey])

  return null
}

export function useRecaptchaToken(action: string) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!siteKey) return
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      if (window.grecaptcha?.ready) {
        window.grecaptcha.ready(() => {
          if (!cancelled) setReady(true)
        })
      } else {
        setTimeout(tick, 200)
      }
    }
    tick()
    return () => {
      cancelled = true
    }
  }, [siteKey])

  const mint = useCallback(async (): Promise<string | null> => {
    if (!siteKey || !ready || !window.grecaptcha) return null
    try {
      return await window.grecaptcha.execute(siteKey, { action })
    } catch {
      return null
    }
  }, [siteKey, ready, action])

  return mint
}
