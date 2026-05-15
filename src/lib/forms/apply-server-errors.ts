'use client'

import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

export type ServerActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

/**
 * Applies a Server Action's `state.fields` (mapping fieldName → messages[])
 * to a react-hook-form instance via `setError`. Returns the top-level
 * `message` if any so the caller can decide whether to also show a toast.
 */
export function applyServerErrors<TValues extends FieldValues>(
  form: UseFormReturn<TValues>,
  state: ServerActionState,
): { message?: string } {
  if (!state.fields) return { message: state.message }
  for (const [field, messages] of Object.entries(state.fields)) {
    if (field === '_') continue // root-level error, surfaced via toast
    form.setError(field as Path<TValues>, {
      type: 'server',
      message: messages[0] ?? 'Invalide',
    })
  }
  return { message: state.message }
}
