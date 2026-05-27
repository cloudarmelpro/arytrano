'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'

/**
 * Confirm-before-destructive-action wrapper.
 *
 * Renders a trigger button styled `variant="ghost"` (or the variant
 * passed). Clicking opens a Base UI `Dialog` (focus trap + Esc to
 * close + backdrop click to dismiss). The "Confirm" button inside
 * the dialog calls the `onConfirm` callback then closes automatically.
 *
 * Used for irreversible admin actions like
 *   - Effacer le profil quiz (drops the quartier from the Q0 list)
 *   - Effacer l'éditorial (reverts the row to the TS-dictionary fallback)
 *   - Future delete flows when we open them up.
 *
 * Memory note `feedback_shadcn_primitives_only` honoured — both the
 * trigger and the confirm button render through the shadcn `<Button>`
 * primitive, never a raw `<button>` with classes.
 */
export function ConfirmDestructive({
  triggerLabel,
  triggerVariant = 'ghost',
  triggerSize = 'default',
  triggerClassName,
  dialogTitle,
  dialogBody,
  confirmLabel,
  cancelLabel = 'Annuler',
  pending = false,
  pendingLabel,
  onConfirm,
}: {
  triggerLabel: string
  triggerVariant?: 'ghost' | 'outline' | 'destructive' | 'secondary'
  triggerSize?: 'default' | 'sm' | 'lg'
  triggerClassName?: string
  dialogTitle: string
  dialogBody: string
  confirmLabel: string
  cancelLabel?: string
  /** Forwarded from the parent action's pending state. */
  pending?: boolean
  pendingLabel?: string
  onConfirm: () => void
}) {
  const [open, setOpen] = useState(false)

  function handleConfirm() {
    onConfirm()
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button
            type="button"
            variant={triggerVariant}
            size={triggerSize}
            className={triggerClassName}
            disabled={pending}
          >
            {triggerLabel}
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <Dialog.Title className="text-lg font-semibold text-foreground">
            {dialogTitle}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            {dialogBody}
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close
              render={
                <Button type="button" variant="outline" disabled={pending}>
                  {cancelLabel}
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={pending}
              aria-busy={pending}
            >
              {pending && pendingLabel ? pendingLabel : confirmLabel}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
