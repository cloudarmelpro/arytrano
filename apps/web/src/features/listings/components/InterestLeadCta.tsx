'use client'

import { useActionState, useEffect, useId, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Dialog } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useT } from '@/lib/i18n/client'
import { createInterestLeadAction } from '@/features/leads/actions/create-interest-lead'

/**
 * E-T28 T-RES-05 — public detail page CTA.
 *
 * Primary call to action that sits ABOVE the existing ContactButtons
 * widget. Opens a Base UI Dialog with a short form (name, phone,
 * move-in window, budget confirmed). On submit, calls the
 * `createInterestLeadAction` Server Action.
 *
 * Memory rules respected :
 *  - shadcn primitives only (Field/FieldLabel/Input/Select/Button).
 *  - Base UI Select needs items={[{value,label}]} OR plain children
 *    SelectItem — we use the latter pattern that already works in
 *    AryTrano (other forms in the dashboard).
 *  - Loading states everywhere : fieldset disable during pending +
 *    useFormStatus inside the submit button, with the parent
 *    transition lifting the overall busy state for the dialog frame.
 *  - aria-labelledby on Checkbox (button role=checkbox).
 */

const INITIAL_STATE = {
  ok: false,
  leadId: undefined as string | undefined,
  message: undefined as string | undefined,
  fields: undefined as Record<string, string[]> | undefined,
}

export function InterestLeadCta({
  listingId,
  listingTitle,
}: {
  listingId: string
  listingTitle: string
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(
    createInterestLeadAction,
    INITIAL_STATE,
  )

  // Auto-close back to confirmation when leadId arrives
  const showConfirmation = state.ok && state.leadId !== undefined

  // Reset form / state when dialog re-opens fresh
  useEffect(() => {
    if (!open) return
    // Don't reset state if the user re-opens to read their confirmation.
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button
            type="button"
            size="lg"
            className="w-full"
            data-testid="lead-cta-open"
          >
            {t('lead.cta.interested')}
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(94vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 shadow-2xl outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          {showConfirmation ? (
            <ConfirmationView
              onClose={() => setOpen(false)}
              messageOverride={state.message ?? null}
            />
          ) : (
            <LeadForm
              listingId={listingId}
              listingTitle={listingTitle}
              formAction={formAction}
              serverMessage={state.message ?? null}
              fieldErrors={state.fields ?? null}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function LeadForm({
  listingId,
  listingTitle,
  formAction,
  serverMessage,
  fieldErrors,
}: {
  listingId: string
  listingTitle: string
  formAction: (formData: FormData) => void
  serverMessage: string | null
  fieldErrors: Record<string, string[]> | null
}) {
  const t = useT()
  const nameId = useId()
  const phoneId = useId()
  const windowId = useId()
  const budgetLabelId = useId()
  const [moveInWindow, setMoveInWindow] = useState('NEXT_MONTH')
  const [budgetConfirmed, setBudgetConfirmed] = useState(true)

  const error = (key: string): string | undefined =>
    fieldErrors?.[key]?.[0] ?? undefined

  return (
    <form action={formAction} aria-describedby="lead-form-context">
      <Dialog.Title className="text-[18px] font-bold leading-tight tracking-tight">
        {t('lead.dialog.title')}
      </Dialog.Title>
      <p
        id="lead-form-context"
        className="mt-1.5 text-[13px] leading-[1.55] text-foreground/70"
      >
        {t('lead.dialog.subtitle', { listing: listingTitle })}
      </p>

      <FormBodyWithPending>
        <FieldGroup className="mt-5">
          <Field data-invalid={!!error('tenantName')}>
            <FieldLabel htmlFor={nameId}>{t('lead.form.name')}</FieldLabel>
            <Input
              id={nameId}
              name="tenantName"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={60}
              aria-invalid={!!error('tenantName')}
            />
            {error('tenantName') ? (
              <FieldError errors={[{ message: error('tenantName')! }]} />
            ) : null}
          </Field>

          <Field data-invalid={!!error('tenantPhone')}>
            <FieldLabel htmlFor={phoneId}>{t('lead.form.phone')}</FieldLabel>
            <Input
              id={phoneId}
              name="tenantPhone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="+261 34 12 345 67"
              aria-invalid={!!error('tenantPhone')}
            />
            <FieldDescription>{t('lead.form.phoneHint')}</FieldDescription>
            {error('tenantPhone') ? (
              <FieldError errors={[{ message: error('tenantPhone')! }]} />
            ) : null}
          </Field>

          <Field data-invalid={!!error('moveInWindow')}>
            <FieldLabel htmlFor={windowId}>
              {t('lead.form.moveInWindow')}
            </FieldLabel>
            <Select
              value={moveInWindow}
              onValueChange={(v) => v && setMoveInWindow(v)}
              items={[
                { value: 'THIS_MONTH', label: t('lead.moveInWindow.thisMonth') },
                { value: 'NEXT_MONTH', label: t('lead.moveInWindow.nextMonth') },
                { value: 'IN_2_MONTHS', label: t('lead.moveInWindow.in2Months') },
                { value: 'FLEXIBLE', label: t('lead.moveInWindow.flexible') },
              ]}
            >
              <SelectTrigger id={windowId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="THIS_MONTH">
                  {t('lead.moveInWindow.thisMonth')}
                </SelectItem>
                <SelectItem value="NEXT_MONTH">
                  {t('lead.moveInWindow.nextMonth')}
                </SelectItem>
                <SelectItem value="IN_2_MONTHS">
                  {t('lead.moveInWindow.in2Months')}
                </SelectItem>
                <SelectItem value="FLEXIBLE">
                  {t('lead.moveInWindow.flexible')}
                </SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="moveInWindow" value={moveInWindow} />
          </Field>

          <Field>
            <label className="flex items-start gap-3 rounded-md border border-border bg-background p-3 cursor-pointer transition hover:border-foreground/30">
              <Checkbox
                checked={budgetConfirmed}
                onCheckedChange={(v) => setBudgetConfirmed(v === true)}
                aria-labelledby={budgetLabelId}
              />
              <span
                id={budgetLabelId}
                className="text-[13.5px] leading-[1.55] text-foreground/85"
              >
                {t('lead.form.budgetConfirmed')}
              </span>
            </label>
            <input
              type="hidden"
              name="budgetConfirmed"
              value={budgetConfirmed ? 'true' : 'false'}
            />
          </Field>

          <input type="hidden" name="listingId" value={listingId} />
        </FieldGroup>

        {serverMessage ? (
          <p
            role="alert"
            className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] font-medium text-destructive"
          >
            {serverMessage}
          </p>
        ) : null}

        <DialogFooter />
      </FormBodyWithPending>

      <p className="mt-4 text-[11.5px] leading-[1.45] text-foreground/55">
        {t('lead.dialog.disclaimer')}
      </p>
    </form>
  )
}

/**
 * Wraps the fieldset with `disabled={pending}` driven by useFormStatus.
 * Lifting the pending into a fieldset (vs the individual inputs) is the
 * project's preferred pattern (memory `feedback_loading_states`).
 */
function FormBodyWithPending({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <fieldset disabled={pending} aria-busy={pending} className="contents">
      {children}
    </fieldset>
  )
}

function DialogFooter() {
  const t = useT()
  const { pending } = useFormStatus()
  return (
    <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Dialog.Close
        render={
          <Button type="button" variant="ghost" disabled={pending}>
            {t('common.cancel')}
          </Button>
        }
      />
      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex items-center justify-center gap-2"
      >
        {pending ? (
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
          />
        ) : null}
        {pending ? t('lead.cta.submitting') : t('lead.cta.submit')}
      </Button>
    </div>
  )
}

function ConfirmationView({
  onClose,
  messageOverride,
}: {
  onClose: () => void
  messageOverride: string | null
}) {
  const t = useT()
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <Dialog.Title className="text-[18px] font-bold leading-tight tracking-tight">
        {t('lead.confirmation.title')}
      </Dialog.Title>
      <p
        className="mt-2 text-[13.5px] leading-[1.55] text-foreground/70"
        role="status"
      >
        {messageOverride ?? t('lead.confirmation.body')}
      </p>
      <div className="mt-6 flex justify-center">
        <Button type="button" onClick={onClose}>
          {t('common.close')}
        </Button>
      </div>
    </div>
  )
}
