'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { bulkModerateListingsAction } from '../actions/bulk-moderate'

/**
 * ADM-02 — provider + bar + row-checkbox for bulk listing moderation.
 *
 * The provider owns a Set<listingId>; SelectListingCheckbox flips its
 * own id in that set; BulkModerationBar reads the set + fires the
 * Server Action. The layout doesn't require deep refactors of the
 * existing card — a small overlay-style checkbox sits on top.
 */
type Ctx = {
  selected: Set<string>
  toggle: (id: string) => void
  clear: () => void
}

const BulkCtx = createContext<Ctx | null>(null)

export function BulkModerationProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])
  const clear = useCallback(() => setSelected(new Set()), [])
  const value = useMemo<Ctx>(() => ({ selected, toggle, clear }), [selected, toggle, clear])
  return <BulkCtx.Provider value={value}>{children}</BulkCtx.Provider>
}

function useBulk(): Ctx {
  const ctx = useContext(BulkCtx)
  if (!ctx) throw new Error('BulkModerationProvider missing')
  return ctx
}

export function SelectListingCheckbox({ listingId }: { listingId: string }) {
  const { selected, toggle } = useBulk()
  const on = selected.has(listingId)
  return (
    <label
      className={`absolute right-3 bottom-3 z-20 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition ${
        on
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background/95 text-foreground/60 hover:border-primary'
      }`}
      aria-label={on ? 'Retirer de la sélection' : 'Ajouter à la sélection'}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={on}
        onChange={() => toggle(listingId)}
        className="sr-only"
      />
      {on ? '✓' : '+'}
    </label>
  )
}

export function BulkModerationBar() {
  const { selected, clear } = useBulk()
  const [pending, setPending] = useState<null | 'verify' | 'unverify' | 'suspend'>(null)
  const [reason, setReason] = useState('')
  const [confirmingSuspend, setConfirmingSuspend] = useState(false)

  if (selected.size === 0) return null

  async function fire(action: 'verify' | 'unverify' | 'suspend', extras: Record<string, string> = {}) {
    setPending(action)
    const fd = new FormData()
    fd.set('listingIds', Array.from(selected).join(','))
    fd.set('action', action)
    for (const [k, v] of Object.entries(extras)) fd.set(k, v)
    const result = await bulkModerateListingsAction({ ok: false }, fd)
    setPending(null)
    if (result.ok) {
      toast.success(
        `${result.succeeded}/${result.processed} annonces mises à jour (${result.failed} échecs).`,
      )
      clear()
      setConfirmingSuspend(false)
      setReason('')
    } else if (result.message) {
      toast.error(result.message)
    }
  }

  return (
    <div
      role="region"
      aria-label="Actions groupées"
      className="fixed inset-x-0 bottom-6 z-40 mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">
          {selected.size} annonce{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}
        </span>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-foreground/60 hover:text-destructive"
        >
          Effacer la sélection
        </button>
      </div>
      {confirmingSuspend ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void fire('suspend', { reason })
          }}
          className="flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3"
        >
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold text-destructive">Motif de suspension</span>
            <input
              type="text"
              required
              minLength={4}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={Boolean(pending)}
              className="h-9 rounded-md border border-border bg-background px-3"
            />
          </label>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              disabled={Boolean(pending) || reason.trim().length < 4}
            >
              {pending === 'suspend' ? 'Suspension…' : `Suspendre ${selected.size}`}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={Boolean(pending)}
              onClick={() => setConfirmingSuspend(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="default"
            disabled={Boolean(pending)}
            onClick={() => fire('verify')}
          >
            {pending === 'verify' ? 'Vérification…' : 'Vérifier'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={Boolean(pending)}
            onClick={() => fire('unverify')}
          >
            {pending === 'unverify' ? 'Retrait…' : 'Retirer la vérification'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={Boolean(pending)}
            onClick={() => setConfirmingSuspend(true)}
          >
            Suspendre…
          </Button>
        </div>
      )}
    </div>
  )
}
