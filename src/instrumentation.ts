// Next 16 instrumentation hook (T-056).
//
// `register()` runs once when the Next.js server boots, BEFORE the
// app handles any request. We dynamically import the right Sentry
// config based on the runtime so the wrong SDK doesn't end up in the
// edge bundle.
//
// `onRequestError` is the Next 16 idiomatic way to capture server-side
// errors (Server Components, Route Handlers, Server Actions). It's
// invoked after Next.js has caught and surfaced the error to the user;
// we forward it to Sentry with the request context.

import type { Instrumentation } from 'next'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  // Lazy import so the Sentry SDK doesn't load when DSN is unset.
  // The SDK itself short-circuits inside captureRequestError when
  // `Sentry.init` was never called.
  const Sentry = await import('@sentry/nextjs')
  Sentry.captureRequestError(err, request, context)
}
