'use client'

import { useEffect } from 'react'

/**
 * Service worker registrar (E-T13 PWA basics). Mounted once at the
 * root layout. Registers `/sw.js` after the page has loaded so the
 * install never competes with first-contentful-paint.
 *
 * Skip-conditions :
 *   - Not in browsers without SW support (very old Android stock)
 *   - Not in dev — Turbopack HMR + SW caching fight each other
 *   - Not in https-required envs without HTTPS (some preview hosts)
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    // Defer to idle to keep the install off the critical path.
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Swallow — SW failure must never break the app.
      })
    }
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => void
    }
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(register)
    } else {
      window.addEventListener('load', register, { once: true })
    }
  }, [])

  return null
}
