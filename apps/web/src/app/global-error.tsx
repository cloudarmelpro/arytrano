'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

/**
 * Root-level error boundary. Catches errors in the root layout itself
 * (e.g. provider init failure, metadata generation crash). Must render
 * its own `<html>` + `<body>` because at this point the layout is
 * broken — Next won't wrap us.
 *
 * Kept intentionally minimalist — no i18n, no shared styles import,
 * because anything we depend on might be the thing that crashed.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system',
          margin: 0,
          padding: '60px 24px',
          textAlign: 'center',
          backgroundColor: '#fff',
          color: '#111',
        }}
      >
        <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>
          AryTrano est temporairement indisponible.
        </h1>
        <p style={{ fontSize: '15px', color: '#666', maxWidth: 480, margin: '0 auto' }}>
          On a été notifié et on regarde le problème. Réessaie dans quelques
          minutes.
        </p>
        {error.digest ? (
          <p
            style={{
              marginTop: 16,
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#999',
            }}
          >
            Code : {error.digest}
          </p>
        ) : null}
      </body>
    </html>
  )
}
