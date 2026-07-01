import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/shared/Icon'

/**
 * Shared layout for the 3 GoalPay return pages :
 *   /transaction/done     (success)
 *   /transaction/canceled (user-aborted)
 *   /transaction/fail     (provider error)
 *
 * Renders a status hero (icon + title + body) and a primary CTA pointing
 * to the relevant follow-up screen (lease detail on success, lease
 * detail on cancel/fail too — the wizard still exists in DRAFT state
 * if the visitor wants to retry the payment).
 *
 * The page is intentionally light : the actual lease state machine is
 * driven by the GoalPay webhook (server-to-server). This screen is only
 * the user-facing "what just happened" beacon ; it MUST NOT mutate any
 * state based on the URL params because the redirect can be replayed
 * by anyone with the link.
 */
export type TransactionStatus = 'done' | 'canceled' | 'fail'

const COPY: Record<
  TransactionStatus,
  {
    icon: 'check' | 'arrow-right' | 'help'
    tone: 'success' | 'neutral' | 'destructive'
    title: string
    body: string
    primaryLabel: string
  }
> = {
  done: {
    icon: 'check',
    tone: 'success',
    title: 'Paiement confirmé',
    body: 'Le locataire reçoit son invitation par email. Tu peux suivre l\'évolution du bail dans ton tableau de bord.',
    primaryLabel: 'Voir le bail',
  },
  canceled: {
    icon: 'arrow-right',
    tone: 'neutral',
    title: 'Paiement annulé',
    body: 'Tu as fermé la fenêtre GoalPay avant de finaliser. Le bail reste en brouillon — tu peux relancer le paiement à tout moment.',
    primaryLabel: 'Reprendre le bail',
  },
  fail: {
    icon: 'help',
    tone: 'destructive',
    title: 'Paiement échoué',
    body: 'Le paiement n\'a pas pu aboutir (solde insuffisant, opérateur indisponible, etc.). Le bail reste en brouillon — réessaye avec un autre moyen de paiement.',
    primaryLabel: 'Reprendre le bail',
  },
}

const TONE_CLASSES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  neutral: 'border-amber-200 bg-amber-50 text-amber-900',
  destructive: 'border-destructive/30 bg-destructive/5 text-destructive',
} as const

// A11y audit C1 fix — `fail` is a negative outcome and gets `role=alert`
// (assertive announcement). `done` + `canceled` are informational and use
// `role=status` (polite, doesn't interrupt). `aria-live` mirrors the same
// politeness so the result is announced even if the page was reached via
// client-side navigation (e.g. a future SPA-style transition from the
// wizard) where the document title alone wouldn't re-fire.
const REGION_ROLE: Record<TransactionStatus, 'status' | 'alert'> = {
  done: 'status',
  canceled: 'status',
  fail: 'alert',
}
const REGION_POLITENESS: Record<TransactionStatus, 'polite' | 'assertive'> = {
  done: 'polite',
  canceled: 'polite',
  fail: 'assertive',
}

export function TransactionResult({
  status,
  leaseHref,
  showLeaseLink,
}: {
  status: TransactionStatus
  /** Where to send the user next. Null when no lease was found
   *  (stale link / unknown reference) — we show a generic home CTA. */
  leaseHref: string | null
  showLeaseLink: boolean
}) {
  const copy = COPY[status]
  return (
    <main
      role={REGION_ROLE[status]}
      aria-live={REGION_POLITENESS[status]}
      className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col items-center justify-center gap-6 px-6 py-16 text-center"
    >
      <div
        className={`grid h-20 w-20 place-items-center rounded-full border-2 ${TONE_CLASSES[copy.tone]}`}
      >
        <Icon name={copy.icon} size={32} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-[clamp(28px,3.4vw,40px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
          {copy.title}
        </h1>
        <p className="max-w-md text-[15px] leading-[1.6] text-foreground/70">
          {copy.body}
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        {showLeaseLink && leaseHref ? (
          <Link href={leaseHref} className={buttonVariants({ size: 'lg' })}>
            {copy.primaryLabel}
          </Link>
        ) : (
          <Link href="/dashboard/leases" className={buttonVariants({ size: 'lg' })}>
            Voir mes baux
          </Link>
        )}
        <Link
          href="/"
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
