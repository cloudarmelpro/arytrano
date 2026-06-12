'use client'

import { useMemo } from 'react'
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
import { calculatePlatformFee } from '../calculate-fees'
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
  // perfectly aligned (no surprise upcharge at signing). Rounded
  // because cautionMonths is Float (½-mois) and MGA has no subunit.
  const cautionMGA = Math.round(monthlyRentMGA * cautionMonths)
  // Revised E-T26 (2026-05-27) — the owner pays nothing. The preview
  // shows what the TENANT will be charged at lease acceptance, as a
  // transparency / educational block for the owner.
  const previewFees = calculatePlatformFee({ monthlyRentMGA })

  // Audit PF-M1 fix — memoize today's ISO date so we don't recompute
  // `new Date()` on every render. The `min` attribute on the date input
  // only needs to be set at mount; React Compiler will likely DCE this
  // but explicit memo signals intent and stays correct under SSR.
  const todayMin = useMemo(() => todayIso(), [])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    run(
      () => initiateLeaseAction({ ok: false }, formData),
      (result) => {
        // Revised E-T26 — no GoalPay redirect from the owner side.
        // Lease is created in PENDING_TENANT and the tenant pays from
        // the lease detail page.
        if (result.leaseId) {
          router.push(`/dashboard/leases/${result.leaseId}`)
        }
      },
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-10" aria-busy={pending}>
      <input type="hidden" name="listingId" value={listingId} />

      {/* Section 1 — Locataire */}
      <section
        aria-labelledby="lease-wizard-section-1-heading"
        className="flex flex-col gap-5"
      >
        <header>
          <span
            aria-hidden
            className="font-mono text-[12px] font-semibold tracking-[0.12em] text-primary"
          >
            01 / 03
          </span>
          <h2
            id="lease-wizard-section-1-heading"
            className="mt-2 font-serif text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.15] tracking-[-0.02em] text-foreground"
          >
            <span className="sr-only">
              {t('lease.wizard.progress', { current: 1, total: 3 })} —{' '}
            </span>
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
                aria-invalid={(fieldErrors.tenantEmail?.length ?? 0) > 0}
                aria-describedby={
                  // A11y audit H1 fix — when an error appears, keep
                  // the help text association too. Dropping the help
                  // ID on error means SR users lose context about
                  // what the field expects right when they need it.
                  fieldErrors.tenantEmail?.length
                    ? 'lease-tenantEmail-help lease-tenantEmail-error'
                    : 'lease-tenantEmail-help'
                }
              />
              <FieldDescription id="lease-tenantEmail-help">
                {t('lease.fields.tenantEmail.help')}
              </FieldDescription>
              {fieldErrors.tenantEmail?.length ? (
                <FieldError id="lease-tenantEmail-error">
                  {fieldErrors.tenantEmail.join(' · ')}
                </FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </fieldset>
      </section>

      {/* Section 2 — Conditions */}
      <section
        aria-labelledby="lease-wizard-section-2-heading"
        className="flex flex-col gap-5 border-t border-border pt-10"
      >
        <header>
          <span
            aria-hidden
            className="font-mono text-[12px] font-semibold tracking-[0.12em] text-primary"
          >
            02 / 03
          </span>
          <h2
            id="lease-wizard-section-2-heading"
            className="mt-2 font-serif text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.15] tracking-[-0.02em] text-foreground"
          >
            <span className="sr-only">
              {t('lease.wizard.progress', { current: 2, total: 3 })} —{' '}
            </span>
            {t('lease.wizard.step2.title')}
          </h2>
          <p className="mt-1.5 text-[14px] leading-[1.55] text-foreground/65">
            {t('lease.wizard.step2.help')}
          </p>
        </header>
        <fieldset disabled={pending} className="contents">
          <FieldGroup>
            {/* Rent + caution are pre-filled from the listing and shown
                read-only here. SEC-H2 audit fix: no hidden field carries
                `monthlyRentMGA` to the server — the service reads
                `listing.priceMonthlyMGA` server-side as the single
                source of truth. */}
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
                      : cautionMonths === 0.5
                        ? t('lease.caution.derived.half')
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
                    min={todayMin}
                    aria-invalid={(fieldErrors.startDate?.length ?? 0) > 0}
                    aria-describedby={
                      // A11y audit A-M3 fix — always link the help text;
                      // append the error ID when an error is showing.
                      fieldErrors.startDate?.length
                        ? 'lease-startDate-help lease-startDate-error'
                        : 'lease-startDate-help'
                    }
                  />
                  <FieldDescription id="lease-startDate-help">
                    {t('lease.fields.startDate.help')}
                  </FieldDescription>
                  {fieldErrors.startDate?.length ? (
                    <FieldError id="lease-startDate-error">
                      {fieldErrors.startDate.join(' · ')}
                    </FieldError>
                  ) : null}
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
                    aria-invalid={(fieldErrors.durationMonths?.length ?? 0) > 0}
                    aria-describedby={
                      // A11y audit H1 fix — keep help + error linked
                      // together when an error fires.
                      fieldErrors.durationMonths?.length
                        ? 'lease-duration-help lease-duration-error'
                        : 'lease-duration-help'
                    }
                  />
                  <FieldDescription id="lease-duration-help">
                    {t('lease.fields.durationMonths.help')}
                  </FieldDescription>
                  {fieldErrors.durationMonths?.length ? (
                    <FieldError id="lease-duration-error">
                      {fieldErrors.durationMonths.join(' · ')}
                    </FieldError>
                  ) : null}
                </Field>
              </div>
            </FieldGroup>
          </FieldGroup>
        </fieldset>
      </section>

      {/* Section 3 — Recap + paiement */}
      <section
        aria-labelledby="lease-wizard-section-3-heading"
        className="flex flex-col gap-5 border-t border-border pt-10"
      >
        <header>
          <span
            aria-hidden
            className="font-mono text-[12px] font-semibold tracking-[0.12em] text-primary"
          >
            03 / 03
          </span>
          <h2
            id="lease-wizard-section-3-heading"
            className="mt-2 font-serif text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.15] tracking-[-0.02em] text-foreground"
          >
            <span className="sr-only">
              {t('lease.wizard.progress', { current: 3, total: 3 })} —{' '}
            </span>
            {t('lease.wizard.step3.title')}
          </h2>
          <p className="mt-1.5 text-[14px] leading-[1.55] text-foreground/65">
            {t('lease.wizard.step3.help', { listing: listingTitle })}
          </p>
        </header>

        {/* Revised E-T26 fee preview — what the TENANT will pay at
            acceptance. The owner pays NOTHING; this block exists for
            transparency so the owner knows what their tenant sees. */}
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <span id="lease-fee-recap-label" className="sr-only">
            {t('lease.wizard.feeRecap.label')}
          </span>
          <dl
            aria-labelledby="lease-fee-recap-label"
            className="flex flex-col gap-3"
          >
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[14px] text-foreground/70">
                {t('lease.fees.platform.label')}
              </dt>
              <dd className="font-serif text-[clamp(24px,2.6vw,32px)] font-normal tabular-nums leading-none text-primary">
                {formatAriary(previewFees.platformFeeMGA)}
              </dd>
            </div>
            <p className="text-[12.5px] leading-[1.5] text-foreground/55">
              {t('lease.fees.platform.help')}
            </p>
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
          {/* A11y audit H3 fix — polite live-region near the submit
              button for SR users. Revised E-T26 — wording is now
              "creating the lease" not "initialising payment". */}
          <span aria-live="polite" className="sr-only">
            {pending ? t('lease.cta.creating') : ''}
          </span>
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
            {t('lease.cta.create')}
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
