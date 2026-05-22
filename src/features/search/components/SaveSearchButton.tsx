'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { useT } from '@/lib/i18n/client'
import { saveSearchAction } from '../actions/saved-search'
import type { SavedSearchFilters } from '../schemas/saved-search'

type Props = {
  /** Whether the current visitor is signed in. Drives the "sign-in first" prompt. */
  signedIn: boolean
}

/**
 * "Sauver la recherche" button on /annonces. Pulls the current URL
 * search params, derives a SavedSearchFilters payload, opens a
 * Dialog asking for a name, then calls the Server Action.
 *
 * For anonymous visitors, the Dialog body invites sign-in instead of
 * letting them name a search that would be orphaned.
 */
export function SaveSearchButton({ signedIn }: Props) {
  const t = useT()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [pending, startTransition] = useTransition()

  function deriveFiltersFromUrl(): SavedSearchFilters {
    const filters: SavedSearchFilters = {}
    const city = params.get('city')
    const neighborhood = params.get('neighborhood')
    const type = params.get('type')
    const priceMin = params.get('priceMin')
    const priceMax = params.get('priceMax')
    const amenities = params.get('amenities')
    const q = params.get('q')
    if (city) filters.city = city
    if (neighborhood) filters.neighborhood = neighborhood
    if (type && ['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE'].includes(type)) {
      filters.type = type as SavedSearchFilters['type']
    }
    if (priceMin && /^\d+$/.test(priceMin)) {
      filters.priceMin = Number(priceMin)
    }
    if (priceMax && /^\d+$/.test(priceMax)) {
      filters.priceMax = Number(priceMax)
    }
    if (amenities) {
      filters.amenities = amenities.split(',').filter(Boolean).slice(0, 20)
    }
    if (q) filters.q = q
    return filters
  }

  function handleSave() {
    const filters = deriveFiltersFromUrl()
    if (Object.keys(filters).length === 0) {
      toast.error(t('savedSearch.save.noFilters'))
      return
    }
    startTransition(async () => {
      const res = await saveSearchAction({ name, filters, alertsOn: true })
      if (res.ok) {
        toast.success(t('savedSearch.save.success'))
        setOpen(false)
        setName('')
      } else if (res.needsAuth) {
        toast.error(t('savedSearch.save.needsAuth'))
      } else {
        toast.error(res.message ?? t('savedSearch.save.error'))
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button type="button" variant="outline" size="sm">
            ★ {t('savedSearch.save.cta')}
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <Dialog.Title className="text-lg font-semibold text-foreground">
            {t('savedSearch.dialog.title')}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            {signedIn
              ? t('savedSearch.dialog.body')
              : t('savedSearch.dialog.signInBody')}
          </Dialog.Description>

          {signedIn ? (
            <div className="mt-5 flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="saved-search-name">
                  {t('savedSearch.dialog.nameLabel')}
                </FieldLabel>
                <Input
                  id="saved-search-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('savedSearch.dialog.namePlaceholder')}
                />
              </Field>
              <div className="flex justify-end gap-2">
                <Dialog.Close
                  render={
                    <Button type="button" variant="outline" disabled={pending}>
                      {t('savedSearch.dialog.cancel')}
                    </Button>
                  }
                />
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={pending || name.length < 2}
                  aria-busy={pending}
                >
                  {pending
                    ? t('savedSearch.dialog.pending')
                    : t('savedSearch.dialog.save')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close
                render={
                  <Button type="button" variant="outline">
                    {t('savedSearch.dialog.cancel')}
                  </Button>
                }
              />
              <Button
                type="button"
                onClick={() => {
                  const returnTo = encodeURIComponent(
                    `/annonces?${params.toString()}`,
                  )
                  window.location.href = `/sign-in?returnTo=${returnTo}`
                }}
              >
                {t('savedSearch.dialog.signInCta')}
              </Button>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
