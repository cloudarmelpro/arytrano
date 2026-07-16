'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'

/**
 * Next.js error boundary for everything below the root layout.
 *
 * Caught here:
 *   - Errors thrown during Server Component rendering
 *   - Errors thrown during Client Component rendering
 *   - Errors thrown by Server Actions when not handled
 *
 * NOT caught here (use `global-error.tsx` for those):
 *   - Errors in the root layout itself
 *   - Errors in metadata generation
 *
 * Sentry receives the error with full stack + the `error.digest` Next
 * generated, which lets us correlate the user-facing display id with
 * the server log.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Sentry.init is no-op when DSN is missing — safe to always call.
    Sentry.captureException(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[640px] flex-col items-center justify-center px-6 py-20 text-center">
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
        Erreur
      </span>
      <h1 className="mt-3 text-[clamp(28px,3.6vw,40px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
        Quelque chose s&apos;est mal passé.
      </h1>
      <p className="mt-3 max-w-[480px] text-[15px] leading-[1.55] text-foreground/70">
        On a été notifié — pas besoin de nous écrire. En attendant tu
        peux essayer de recharger la page ou revenir à l&apos;accueil.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-[12px] text-muted-foreground">
          Code : {error.digest}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center rounded-xl bg-primary px-5 text-[14.5px] font-semibold text-primary-foreground transition hover:opacity-95"
        >
          Recharger
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-xl bg-muted/60 px-5 text-[14.5px] font-semibold text-foreground transition hover:bg-muted"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
