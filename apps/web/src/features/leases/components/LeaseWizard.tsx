'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Icon } from '@/components/shared/Icon'
import { useT } from '@/lib/i18n/client'
import { formatAriary } from '@/lib/format/currency'
import { calculateLeaseFees } from '../calculate-fees'
import { initiateLeaseAction } from '../actions/initiate-lease'
import { useLeaseAction } from './use-lease-action'

/**
 * 3-section lease wizard. Single page (not stepped navigation) — keeps
 * the visitor in one mental scroll, sees the live fee recap at the
 * bottom while editing fields above.
 *
 * The fee recap is computed client-side via `calculateLeaseFees` so it
 * matches the server-side charge to the rounding bit (same pure
 * function, both ends).
 */
export function LeaseWizard({
  listingId,
  listingTitle,
  monthlyRentMGA,
  cautionMonths,
}: {
  listingId: string
  listingTitle: string
  /** Pre-filled from the listing — owner cannot edit on a per-lease basis. */
  monthlyRentMGA: number
  /** Multiplier on monthlyRentMGA, declared at listing creation (0-3). */
  cautionMonths: number
}) {
  const t = useT()
  const router = useRouter()
  const { pending, serverError, fieldErrors, run } = useLeaseAction()

  // Caution is DERIVED from the listing — never asked from the owner
  // here. This keeps the public listing display and the lease totals
  // perfectly aligned (no surprise upcharge at signing).
  const cautionMGA = monthlyRentMGA * cautionMonths
  const previewFees = calculateLeaseFees({ cautionMGA })

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    run(
      () => initiateLeaseAction({ ok: false }, formData),
      (result) => {
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl
        } else if (result.leaseId) {
          router.push(`/dashboard/leases/${result.leaseId}`)
        }
      },
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-10" aria-busy={pending}>
      <input type="hidden" name="listingId" value={listingId} />

      {/* Section 1 — Locataire */}
      <section className="flex flex-col gap-5">
        <header>
          <span className="font-mono text-[12px] font-semibold tracking-[0.12em] text-primary">
            01 / 03
          </span>
          <h2 className="mt-2 font-serif text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.15] tracking-[-0.02em] text-foreground">
            {t('lease.wizard.step1.title')}
          </h2>
          <p className="mt-1.5 text-[14px] leading-[1.55] text-foreground/65">
            {t('lease.wizard.step1.help')}
          </p>
        </header>
        <fieldset disabled={pending} className="contents">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="lease-tenantEmail">
                {t('lease.fields.tenantEmail')}
              </FieldLabel>
              <Input
                id="lease-tenantEmail"
                name="tenantEmail"
                type="email"
                required
                placeholder="locataire@example.mg"
                autoComplete="email"
              />
              <FieldDescription>
                {t('lease.fields.tenantEmail.help')}
              </FieldDescription>
              {fieldErrors.tenantEmail?.map((m) => (
                <FieldError key={m}>{m}</FieldError>
              ))}
            </Field>
          </FieldGroup>
        </fieldset>
      </section>

      {/* Section 2 — Conditions */}
      <section className="flex flex-col gap-5 border-t border-border pt-10">
        <header>
          <span className="font-mono text-[12px] font-semibold tracking-[0.12em] text-primary">
            02 / 03
          </span>
          <h2 className="mt-2 font-serif text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.15] tracking-[-0.02em] text-foreground">
            {t('lease.wizard.step2.title')}
          </h2>
          <p className="mt-1.5 text-[14px] leading-[1.55] text-foreground/65">
            {t('lease.wizard.step2.help')}
          </p>
        </header>
        <fieldset disabled={pending} className="contents">
          <FieldGroup>
            {/* Rent + caution are pre-filled from the listing and shown
                read-only here so the owner can verify but not edit.
                A hidden `monthlyRentMGA` field carries the value to the
                Server Action without giving the owner an input to fudge. */}
            <input type="hidden" name="monthlyRentMGA" value={monthlyRentMGA} />
            <dl className="grid gap-4 rounded-2xl border border-border bg-muted/30 p-5 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
                  {t('lease.fields.monthlyRent')}
                </dt>
                <dd className="mt-1 font-mono text-[15px] font-bold tabular-nums text-foreground">
                  {formatAriary(monthlyRentMGA)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
                  {t('lease.fields.caution')}
                </dt>
                <dd className="mt-1 flex flex-col">
                  <span className="font-mono text-[15px] font-bold tabular-nums text-foreground">
                    {formatAriary(cautionMGA)}
                  </span>
                  <span className="text-[11.5px] text-foreground/55">
                    {cautionMonths === 0
                      ? t('lease.caution.derived.none')
                      : t('lease.caution.derived.months', {
                          count: cautionMonths,
                        })}
                  </span>
                </dd>
              </div>
            </dl>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="lease-startDate">
                    {t('lease.fields.startDate')}
                  </FieldLabel>
                  <Input
                    id="lease-startDate"
                    name="startDate"
                    type="date"
                    required
                    min={todayIso()}
                  />
                  {fieldErrors.startDate?.map((m) => (
                    <FieldError key={m}>{m}</FieldError>
                  ))}
                </Field>
                <Field>
                  <FieldLabel htmlFor="lease-duration">
                    {t('lease.fields.durationMonths')}
                  </FieldLabel>
                  <Input
                    id="lease-duration"
                    name="durationMonths"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={60}
                    step={1}
                    required
                    defaultValue={12}
                  />
                  <FieldDescription>
                    {t('lease.fields.durationMonths.help')}
                  </FieldDescription>
                  {fieldErrors.durationMonths?.map((m) => (
                    <FieldError key={m}>{m}</FieldError>
                  ))}
                </Field>
              </div>
            </FieldGroup>
          </FieldGroup>
        </fieldset>
      </section>

      {/* Section 3 — Recap + paiement */}
      <section className="flex flex-col gap-5 border-t border-border pt-10">
        <header>
          <span className="font-mono text-[12px] font-semibold tracking-[0.12em] text-primary">
            03 / 03
          </span>
          <h2 className="mt-2 font-serif text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.15] tracking-[-0.02em] text-foreground">
            {t('lease.wizard.step3.title')}
          </h2>
          <p className="mt-1.5 text-[14px] leading-[1.55] text-foreground/65">
            {t('lease.wizard.step3.help', { listing: listingTitle })}
          </p>
        </header>

        {/* Live fee preview — magazine pull-quote style */}
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <dl className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[14px] text-foreground/70">
                {t('lease.fees.signature')}
              </dt>
              <dd className="font-mono text-[15px] font-semibold tabular-nums text-foreground">
                {formatAriary(previewFees.signatureFeeMGA)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[14px] text-foreground/70">
                {t('lease.fees.commission')}
              </dt>
              <dd className="font-mono text-[15px] font-semibold tabular-nums text-foreground">
                {formatAriary(previewFees.cautionCommissionMGA)}
              </dd>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-border pt-3">
              <dt className="text-[15px] font-bold text-foreground">
                {t('lease.fees.total')}
              </dt>
              <dd className="font-serif text-[clamp(24px,2.6vw,32px)] font-normal tabular-nums leading-none text-primary">
                {formatAriary(previewFees.totalMGA)}
              </dd>
            </div>
          </dl>
        </div>

        {serverError ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13.5px] font-medium text-destructive"
          >
            {serverError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            type="submit"
            disabled={pending}
            size="lg"
            className="gap-2 px-7"
          >
            {pending ? (
              <span
                aria-hidden
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
              />
            ) : (
              <Icon name="arrow-right" size={16} />
            )}
            {t('lease.cta.payAndSign')}
          </Button>
          <p className="text-[12.5px] font-medium text-foreground/55">
            {t('lease.cta.microcopy')}
          </p>
        </div>
      </section>
    </form>
  )
}

function todayIso(): string {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
