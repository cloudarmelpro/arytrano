'use client'

import { useCallback, useTransition } from 'react'
import {
  useRouter,
  useSearchParams,
  usePathname,
  type ReadonlyURLSearchParams,
} from 'next/navigation'

export type UrlFilters = {
  /** Current URL search params (read-only snapshot). */
  params: ReadonlyURLSearchParams
  /** True while the router transition is in flight — wire to `disabled` / `aria-busy`. */
  pending: boolean
  /** Low-level escape hatch — commit a pre-built query string. */
  push: (qs: string) => void
  /** Set / delete several params in one router.replace. */
  updateMultiple: (updates: Record<string, string | null>) => void
  /** Convenience — set one param (empty string deletes it). */
  updateParam: (key: string, value: string | null) => void
  /** Delete one or more params. */
  removeParams: (...keys: string[]) => void
  /** Wipe everything — back to bare pathname. */
  reset: () => void
}

/**
 * URL-filter helpers for client filter components. Centralizes the
 * `useTransition + router.replace + URLSearchParams + delete('cursor')`
 * pattern that recurs across the listings filter UI.
 *
 * Every committed change clears `?cursor=` (any filter change rewinds
 * pagination to page 1) and forces `scroll: false` so filter pivots
 * never jump the visitor to the top.
 *
 * Lives in `lib/` because the helper is URL-mechanism plumbing, not
 * domain logic — any feature wiring URL-driven filters can consume it.
 */
export function useUrlFilters(): UrlFilters {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const push = useCallback(
    (qs: string) => {
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      })
    },
    [router, pathname],
  )

  const updateMultiple = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v) next.set(k, v)
        else next.delete(k)
      }
      next.delete('cursor')
      push(next.toString())
    },
    [params, push],
  )

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      updateMultiple({ [key]: value || null })
    },
    [updateMultiple],
  )

  const removeParams = useCallback(
    (...keys: string[]) => {
      const updates: Record<string, null> = {}
      for (const k of keys) updates[k] = null
      updateMultiple(updates)
    },
    [updateMultiple],
  )

  const reset = useCallback(() => {
    push('')
  }, [push])

  return {
    params,
    pending,
    push,
    updateMultiple,
    updateParam,
    removeParams,
    reset,
  }
}
