'use client'

import { startTransition, useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Dialog } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { openDisputeAction } from '../actions/open-dispute'

export function OpenDisputeDialog({ leaseId }: { leaseId: string }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(openDisputeAction, {
    ok: false,
    message: undefined as string | undefined,
    disputeId: undefined as string | undefined,
    fields: undefined as Record<string, string[]> | undefined,
  })

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button type="button" variant="outline" size="sm" className="text-destructive border-destructive/40 hover:bg-destructive/5">
            ⚠️ Ouvrir un litige
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(94vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 shadow-2xl">
          {state.ok && state.disputeId ? (
            <Resolution onClose={() => setOpen(false)} />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                fd.set('leaseId', leaseId)
                startTransition(() => formAction(fd))
              }}
            >
              <Dialog.Title className="text-[18px] font-bold leading-tight">
                Ouvrir un litige
              </Dialog.Title>
              <p className="mt-1.5 text-[13px] leading-[1.55] text-foreground/65">
                Décris ton désaccord sur la caution. Un admin AryTrano compare
                l’état des lieux d’entrée et de sortie + ces messages, et rend
                un avis non contraignant sous 7 jours ouvrés.
              </p>

              <div className="mt-5 flex flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor="dispute-amount">
                    Montant en jeu (Ar)
                  </FieldLabel>
                  <Input
                    id="dispute-amount"
                    name="amountAtStakeMGA"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100000000}
                    required
                    placeholder="200000"
                  />
                  <FieldDescription>
                    Montant retenu sur la caution ou réclamé.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="dispute-claim">Description</FieldLabel>
                  <Textarea
                    id="dispute-claim"
                    name="initialClaim"
                    rows={6}
                    maxLength={3000}
                    minLength={20}
                    required
                    placeholder="Ex : le propriétaire retient 200 000 Ar pour des taches sur le mur cuisine — j’ai photographié ces taches AVANT l’emménagement (voir état d’entrée pièce CUISINE)."
                  />
                </Field>

                {state.message ? (
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive"
                  >
                    {state.message}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Dialog.Close
                  render={
                    <Button type="button" variant="ghost">
                      Annuler
                    </Button>
                  }
                />
                <SubmitButton />
              </div>
            </form>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} variant="destructive">
      {pending ? 'Envoi…' : 'Ouvrir le litige'}
    </Button>
  )
}

function Resolution({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        ⚠️
      </div>
      <Dialog.Title className="text-[18px] font-bold leading-tight">
        Litige ouvert
      </Dialog.Title>
      <p className="mt-2 text-[13.5px] leading-[1.55] text-foreground/70">
        L’équipe AryTrano vous recontacte sous 7 jours. Vous pouvez suivre les
        échanges depuis la page bail.
      </p>
      <div className="mt-6 flex justify-center">
        <Button type="button" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  )
}
