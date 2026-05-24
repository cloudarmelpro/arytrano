// AryTrano — Sentry edge runtime SDK initialization
//
// Runs in middleware (`src/proxy.ts`) and any route handlers configured
// with `runtime: 'edge'`. Edge runtime has a restricted Node API
// surface — the Sentry SDK auto-detects this and uses lighter
// instrumentation.

import * as Sentry from '@sentry/nextjs'
import { scrubPii } from './src/lib/observability/scrub-pii'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    beforeSend(event) {
      return scrubPii(event)
    },
  })
}
