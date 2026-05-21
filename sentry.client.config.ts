// AryTrano — Sentry browser SDK initialization
//
// Runs in the client bundle. Captures unhandled errors + promise
// rejections in user browsers. When `NEXT_PUBLIC_SENTRY_DSN` is not
// set, `Sentry.init` becomes a no-op — zero network traffic, minimal
// bundle impact.

import * as Sentry from '@sentry/nextjs'
import { scrubPii } from './src/lib/observability/scrub-pii'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,

    // Trace 10% of transactions in prod to stay inside the 5k/mo free
    // tier. Override via env if quota allows or we need a debug spike.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),

    // Session Replay disabled by default — privacy + bandwidth cost on
    // 3G Madagascar. Enable per-incident if needed via dashboard.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Strip PII before any payload leaves the browser.
    beforeSend(event) {
      return scrubPii(event)
    },

    // Don't capture errors that aren't actionable (browser extensions,
    // adblock false positives, etc.).
    ignoreErrors: [
      // Browser extensions
      /extension\//i,
      /^chrome:\/\//,
      // Network errors the user can't act on
      'NetworkError when attempting to fetch resource',
      // Aborted fetches (user navigated away mid-request)
      'AbortError',
      // ResizeObserver loop limit — known false positive, harmless
      'ResizeObserver loop limit exceeded',
    ],
  })
}
