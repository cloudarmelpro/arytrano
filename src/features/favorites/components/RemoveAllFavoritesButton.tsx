'use client'

import { useState, useTransition } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import { removeAllFavoritesAction } from '../actions/remove-all-favorites'

/**
 * "Retirer tous mes favoris" button on /dashboard/favoris.
 *
 * Opens a Base UI Dialog (focus trap + ESC handling) asking for
 * confirmation before calling `removeAllFavoritesAction`. After
 * success the page revalidates (server action does revalidatePath)
 * — the list visibly empties, no need to refresh.
 *
 * Disabled-by-`count` so we don't show it when there's nothing to
 * remove.
 */
export function RemoveAllFavoritesButton({ count }: { count: number }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  if (count === 0) return null

  function handleConfirm() {
    startTransition(async () => {
      const res = await removeAllFavoritesAction()
      if (res.ok) {
        toast.success(t('favorites.removeAll.success', { count: res.removed }))
        setOpen(false)
      } else if (res.needsAuth) {
        toast.error(t('favorites.removeAll.needsAuth'))
      } else {
        toast.error(t('favorites.removeAll.error'))
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            {t('favorites.removeAll.cta')}
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <Dialog.Title className="text-lg font-semibold text-foreground">
            {t('favorites.removeAll.dialog.title')}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            {t('favorites.removeAll.dialog.body', { count })}
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close
              render={
                <Button type="button" variant="outline" disabled={pending}>
                  {t('favorites.removeAll.dialog.cancel')}
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
              {pending
                ? t('favorites.removeAll.dialog.pending')
                : t('favorites.removeAll.dialog.confirm')}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
