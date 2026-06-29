'use client'

import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn, FieldValues } from 'react-hook-form'

/**
 * EDT-01 — auto-save draft for the create-listing form.
 *
 * Persists the working form values to localStorage every `intervalMs`
 * milliseconds (default 30s) so a tab close, accidental reload, or 3G
 * disconnect doesn't wipe a long composition. Pure client-side — no
 * Server Action call here, the user still gets a real DRAFT row when
 * they click "Save" through the existing createListingAction.
 *
 * Why not write to the DB every 30s : creating empty DRAFT rows on
 * every visitor that opens the form would pollute the listings table
 * and trigger TRU-05 rate-limits (3 drafts/hour). LocalStorage gives
 * the recovery UX without the side-effects.
 *
 * Restore strategy: on mount, read the snapshot and call `reset()` on
 * the form. We don't auto-restore over user input — only if the form
 * is still pristine (untouched).
 */
export type UseListingDraftAutosaveOptions<TValues extends FieldValues> = {
  form: UseFormReturn<TValues>
  storageKey: string
  /** When false, the hook is a no-op (use this in edit mode). */
  enabled: boolean
  intervalMs?: number
}

export type DraftAutosaveState = {
  /** ISO timestamp of the last successful save, null until first save. */
  lastSavedAt: string | null
  /** True when a restored snapshot was loaded into the form on mount. */
  restored: boolean
  /** Wipe localStorage + reset the lastSavedAt indicator. */
  clear: () => void
}

export function useListingDraftAutosave<TValues extends FieldValues>({
  form,
  storageKey,
  enabled,
  intervalMs = 30_000,
}: UseListingDraftAutosaveOptions<TValues>): DraftAutosaveState {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [restored, setRestored] = useState(false)
  const restoreAttemptedRef = useRef(false)

  // Restore once on mount.
  useEffect(() => {
    if (!enabled || restoreAttemptedRef.current) return
    restoreAttemptedRef.current = true
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as {
        values: TValues
        savedAt: string
      }
      // Only restore if the form is pristine — never clobber user input.
      if (!form.formState.isDirty) {
        form.reset(parsed.values)
        setLastSavedAt(parsed.savedAt)
        setRestored(true)
      }
    } catch {
      /* corrupted entry — ignore, the interval will overwrite it */
    }
    // form is stable from RHF; storageKey is the only dep that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, enabled])

  // Periodic save.
  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => {
      try {
        const snapshot = {
          values: form.getValues(),
          savedAt: new Date().toISOString(),
        }
        window.localStorage.setItem(storageKey, JSON.stringify(snapshot))
        setLastSavedAt(snapshot.savedAt)
      } catch {
        /* storage full / private mode — silently skip */
      }
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [enabled, intervalMs, storageKey, form])

  return {
    lastSavedAt,
    restored,
    clear: () => {
      try {
        window.localStorage.removeItem(storageKey)
      } catch {
        /* ignore */
      }
      setLastSavedAt(null)
    },
  }
}
