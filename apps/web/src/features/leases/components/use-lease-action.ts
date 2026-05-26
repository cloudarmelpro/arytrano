'use client'

import { useState, useTransition } from 'react'

/**
 * Shape returned by lease Server Actions (`initiateLeaseAction`,
 * `tenantSignLeaseAction`, `tenantRefuseLeaseAction`). Each action returns
 * `{ ok, message?, fields? }` plus its own success payload merged in.
 */
type LeaseActionResult = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

/**
 * A7 audit fix — `LeaseWizard` and `LeaseTenantActions` had identical
 * wiring: `useTransition()` + `serverError`/`fieldErrors` state + the same
 * reset-then-startTransition-then-branch-on-result loop. This hook
 * collapses that to a single `run(action, onSuccess)` call.
 *
 * Kept feature-local on purpose: if a third consumer shows up we'll lift
 * it to `lib/hooks/`, but right now it serves exactly two files.
 */
export function useLeaseAction() {
  const [pending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  function run<T extends LeaseActionResult>(
    action: () => Promise<T>,
    onSuccess: (result: T) => void,
  ) {
    setServerError(null)
    setFieldErrors({})
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        if (result.fields) setFieldErrors(result.fields)
        if (result.message) setServerError(result.message)
        return
      }
      onSuccess(result)
    })
  }

  return { pending, serverError, fieldErrors, run }
}
