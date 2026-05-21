// AryTrano — Sentry Node.js (server runtime) SDK initialization
//
// Runs inside Server Components, Server Actions, Route Handlers, and
// any other Node-side code. The Next 16 `instrumentation.ts` invokes
// this file via dynamic import in its `register()` hook.

import * as Sentry from '@sentry/nextjs'
import { scrubPii } from './src/lib/observability/scrub-pii'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),

    // Strip PII before any payload leaves the server.
    beforeSend(event) {
      return scrubPii(event)
    },

    // Known harmless server errors to drop at the source.
    ignoreErrors: [
      // Zod validation errors flow back to the client as 400s, not
      // unexpected exceptions. Don't pollute Sentry with them.
      'ZodError',
      // Auth.js redirect throw is intentional control-flow, not an error.
      'NEXT_REDIRECT',
      'NEXT_NOT_FOUND',
    ],
  })
}
