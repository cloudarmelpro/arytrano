'use client'

import { Component, type ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'

/**
 * EDT-12 — granular error boundary for in-page sections.
 *
 * Wraps a section (map, related listings, lead CTA, chart, etc.) so a
 * runtime error inside it shows a small fallback chip instead of the
 * Next.js route-level `error.tsx` taking out the whole page. Reports
 * to Sentry with a section tag for triage.
 *
 * Server Components can't ship their own error boundaries (they crash
 * during render and Suspense handles the streaming), but Client
 * Components rendered via the RSC payload CAN throw at hydration time
 * — that's the failure mode this catches.
 *
 * Class component because React Hooks have no equivalent API (no
 * useErrorBoundary in stable React); the class API is the supported
 * surface.
 */
type Props = {
  /** Stable tag used for Sentry triage + the fallback label. */
  section: string
  children: ReactNode
  /** Optional custom fallback overriding the default small chip. */
  fallback?: ReactNode
}

type State = { hasError: boolean }

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    Sentry.captureException(error, {
      tags: { kind: 'section-error-boundary', section: this.props.section },
      // componentStack may carry component names but never PII; safe to forward.
      extra: { componentStack: info.componentStack ?? null },
    })
  }

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback !== undefined) return this.props.fallback

    return (
      <div
        role="alert"
        className="rounded-md border border-dashed border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive"
      >
        Cette section n’a pas pu s’afficher. Rafraîchis la page si le problème
        persiste — le reste du site reste utilisable.
      </div>
    )
  }
}
