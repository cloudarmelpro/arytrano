'use client'

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useState,
} from 'react'
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
import { createInterestLeadAction } from '@/features/leads'
import {
  requestPhoneOtpAction,
  verifyPhoneOtpAction,
} from '@/features/phone-otp'

/**
 * E-T28 T-RES-05 + T-002 T-002.5 — public detail page CTA.
 *
 * 2-step flow (added 2026-06-11) :
 *
 *   Step 1 : visitor fills name + phone + move-in + budget. Submits.
 *   Step 2 : if `otp_required`, dialog flips to the SMS code form.
 *            On code verify, re-runs the submit silently.
 *
 * The OTP code flow re-uses the same dialog frame so the visitor
 * experiences "one continuous form, just with a verify pause".
 */

type LeadFormDraft = {
  listingId: string
  tenantName: string
  tenantPhone: string
  moveInWindow: string
  budgetConfirmed: boolean
}

const LEAD_INITIAL = {
  ok: false,
  leadId: undefined as string | undefined,
  message: undefined as string | undefined,
  fields: undefined as Record<string, string[]> | undefined,
}

export function InterestLeadCta({
  listingId,
  listingTitle,
  smsConsoleMock = false,
}: {
  listingId: string
  listingTitle: string
  /**
   * True when the SMS provider is the dev console mock. Surfaces a
   * hint banner on the OTP step so the visitor knows where to look
   * for the code (stdout). Hidden when a real provider (Twilio etc.)
   * is sending real SMS to the visitor's phone.
   */
  smsConsoleMock?: boolean
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form')
  /** Last submitted draft — kept so we can resubmit silently after OTP verify. */
  const [draft, setDraft] = useState<LeadFormDraft | null>(null)
  const [leadState, leadAction] = useActionState(
    createInterestLeadAction,
    LEAD_INITIAL,
  )

  // Flip to OTP step when the server flags otp_required, to success
  // when leadId arrives. The `react-hooks/set-state-in-effect` rule
  // flags this pattern ; suppressed per call because the Server Action
  // result is the trigger and we have nowhere else to bridge it into
  // local UI state (memory feedback_useEffect_external_bridge).
  useEffect(() => {
    if (leadState.ok && leadState.leadId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('success')
    } else if (
      leadState.fields?._form?.includes('otp_required') &&
      step === 'form'
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('otp')
    }
  }, [leadState, step])

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          // Reset state on close so re-open is a fresh slate.
          setStep('form')
          setDraft(null)
        }
      }}
    >
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
          {step === 'success' ? (
            <ConfirmationView
              onClose={() => setOpen(false)}
              messageOverride={leadState.message ?? null}
            />
          ) : step === 'otp' ? (
            <OtpView
              draft={draft}
              listingTitle={listingTitle}
              smsConsoleMock={smsConsoleMock}
              onBack={() => setStep('form')}
              onVerified={() => {
                // Re-submit the lead via the same form action — the
                // service will now see hasRecentlyVerifiedPhone === true.
                if (!draft) return
                const fd = new FormData()
                fd.set('listingId', draft.listingId)
                fd.set('tenantName', draft.tenantName)
                fd.set('tenantPhone', draft.tenantPhone)
                fd.set('moveInWindow', draft.moveInWindow)
                fd.set('budgetConfirmed', String(draft.budgetConfirmed))
                // React 19 : dispatcher must run inside startTransition
                // when not bound to a form action.
                startTransition(() => leadAction(fd))
              }}
            />
          ) : (
            <LeadForm
              listingId={listingId}
              listingTitle={listingTitle}
              formAction={leadAction}
              serverMessage={
                leadState.fields?._form?.includes('otp_required')
                  ? null
                  : leadState.message ?? null
              }
              fieldErrors={leadState.fields ?? null}
              onDraftCaptured={setDraft}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ============================================================
// Step 1 — Lead form
// ============================================================

function LeadForm({
  listingId,
  listingTitle,
  formAction,
  serverMessage,
  fieldErrors,
  onDraftCaptured,
}: {
  listingId: string
  listingTitle: string
  formAction: (formData: FormData) => void
  serverMessage: string | null
  fieldErrors: Record<string, string[]> | null
  onDraftCaptured: (d: LeadFormDraft) => void
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

  function handleSubmit(formData: FormData) {
    // Capture the draft BEFORE the form action runs so the OTP step
    // can re-submit silently with the same values.
    onDraftCaptured({
      listingId,
      tenantName: String(formData.get('tenantName') ?? ''),
      tenantPhone: String(formData.get('tenantPhone') ?? ''),
      moveInWindow: String(formData.get('moveInWindow') ?? 'NEXT_MONTH'),
      budgetConfirmed: formData.get('budgetConfirmed') === 'true',
    })
    formAction(formData)
  }

  return (
    <form action={handleSubmit} aria-describedby="lead-form-context">
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

// ============================================================
// Step 2 — OTP code form
// ============================================================

function OtpView({
  draft,
  listingTitle,
  smsConsoleMock,
  onBack,
  onVerified,
}: {
  draft: LeadFormDraft | null
  listingTitle: string
  smsConsoleMock: boolean
  onBack: () => void
  onVerified: () => void
}) {
  const t = useT()
  const codeId = useId()

  // Request a code as soon as the OTP step mounts (with the draft phone).
  const [requestState, requestAction] = useActionState(
    requestPhoneOtpAction,
    { ok: false } as { ok: boolean; message?: string; expiresAtIso?: string },
  )
  const [verifyState, verifyAction] = useActionState(
    verifyPhoneOtpAction,
    {
      ok: false,
    } as { ok: boolean; message?: string },
  )

  // Trigger an initial code-request on mount if none has been issued
  // yet. React 19 / Next 16 require useActionState dispatchers to be
  // wrapped in startTransition when not bound to a <form action>.
  useEffect(() => {
    if (!draft) return
    if (requestState.ok || requestState.message) return
    const fd = new FormData()
    fd.set('phoneE164', draft.tenantPhone)
    startTransition(() => requestAction(fd))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  // When verify succeeds, re-submit the lead.
  useEffect(() => {
    if (verifyState.ok) onVerified()
  }, [verifyState.ok, onVerified])

  if (!draft) {
    // Defensive — onBack to recover.
    return (
      <div className="text-center">
        <p>État perdu. Reviens à l’étape précédente.</p>
        <Button type="button" onClick={onBack} className="mt-3">
          ← Retour
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Dialog.Title className="text-[18px] font-bold leading-tight tracking-tight">
        {t('lead.otp.title')}
      </Dialog.Title>
      <p className="mt-1.5 text-[13px] leading-[1.55] text-foreground/70">
        {t('lead.otp.subtitle', { phone: draft.tenantPhone })}
      </p>
      <p className="mt-2 text-[11.5px] text-foreground/55">
        Annonce : {listingTitle}
      </p>

      {/* Dev hint only when the SMS provider is the console mock —
          surfaces the "look at stdout for the code" reminder. Hidden
          when a real provider (Twilio etc.) sends real SMS. */}
      {smsConsoleMock ? (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2 text-[11.5px] leading-[1.4] text-amber-900">
          {t('lead.otp.smsConsole.banner')}
        </p>
      ) : null}

      <form action={verifyAction} className="mt-5">
        <input type="hidden" name="phoneE164" value={draft.tenantPhone} />
        <FieldGroup>
          <Field data-invalid={!verifyState.ok && !!verifyState.message}>
            <FieldLabel htmlFor={codeId}>
              {t('lead.otp.codeLabel')}
            </FieldLabel>
            <Input
              id={codeId}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              minLength={6}
              pattern="\d{6}"
              placeholder={t('lead.otp.codePlaceholder')}
              autoFocus
              aria-invalid={!verifyState.ok && !!verifyState.message}
            />
            {!verifyState.ok && verifyState.message ? (
              <FieldError errors={[{ message: verifyState.message }]} />
            ) : null}
            {requestState.message && !requestState.ok ? (
              <FieldError errors={[{ message: requestState.message }]} />
            ) : null}
          </Field>
        </FieldGroup>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
          <button
            type="button"
            onClick={onBack}
            className="text-[12.5px] font-medium text-primary hover:underline self-start"
          >
            {t('lead.otp.changeNumber')}
          </button>
          <div className="flex gap-2">
            <ResendButton phoneE164={draft.tenantPhone} requestAction={requestAction} />
            <VerifySubmitButton />
          </div>
        </div>
      </form>
    </div>
  )
}

function ResendButton({
  phoneE164,
  requestAction,
}: {
  phoneE164: string
  requestAction: (fd: FormData) => void
}) {
  const t = useT()
  const [pending, setPending] = useState(false)
  return (
    <Button
      type="button"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        setPending(true)
        const fd = new FormData()
        fd.set('phoneE164', phoneE164)
        // React 19 : dispatcher must run inside startTransition when not
        // bound to a form action.
        startTransition(() => requestAction(fd))
        // Re-enable after a small cooldown so the visitor doesn't tap
        // a dozen times in a row.
        setTimeout(() => setPending(false), 3000)
      }}
      className="text-[13px]"
    >
      {pending ? t('lead.otp.resending') : t('lead.otp.resend')}
    </Button>
  )
}

function VerifySubmitButton() {
  const t = useT()
  const { pending } = useFormStatus()
  return (
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
      {pending ? t('lead.otp.submitting') : t('lead.otp.submit')}
    </Button>
  )
}

// ============================================================
// Shared bits
// ============================================================

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
