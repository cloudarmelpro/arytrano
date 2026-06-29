'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  markPaymentRefundedAction,
  type MarkPaymentRefundedActionState,
} from '@/features/payments'

const INITIAL: MarkPaymentRefundedActionState = { ok: false }

/**
 * PAY-09 — inline "Mark refunded" row UI for /admin/refunds. Expands
 * a note field on click so the admin types the GoalPay ticket id +
 * refund transaction id before confirming. The Server Action
 * audit-logs the change.
 */
export function MarkRefundedRow({ paymentId }: { paymentId: string }) {
  const [state, action, pending] = useActionState(
    markPaymentRefundedAction,
    INITIAL,
  )
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (state.ok) {
      toast.success('Refund marqué comme effectué.')
      setOpen(false)
      setNote('')
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state])

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        Marquer remboursé
      </Button>
    )
  }

  return (
    <form action={action} className="flex min-w-[260px] flex-col gap-2">
      <input type="hidden" name="paymentId" value={paymentId} />
      <textarea
        name="note"
        required
        rows={2}
        minLength={4}
        maxLength={500}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={pending}
        placeholder="Ticket GoalPay + ID transaction du refund…"
        className="min-h-[56px] w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending || note.trim().length < 4}>
          {pending ? 'Enregistrement…' : 'Confirmer'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(false)
            setNote('')
          }}
          disabled={pending}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
