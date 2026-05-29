import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/features/auth'
import { OwnerTermsForm } from '@/features/auth/components/OwnerTermsForm'
import { prisma } from '@/lib/db'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export const metadata: Metadata = {
  title: 'Conditions propriétaire',
  robots: { index: false, follow: false },
}

/**
 * T-049 — Owner Terms onboarding gate.
 *
 * Reached when a freshly-signed-up OWNER account hasn't accepted the
 * dedicated Owner Terms yet, OR when a legacy owner signs in for the
 * first time after this feature shipped.
 *
 * If the visitor is :
 *   - Not signed in → redirect /sign-in?next=/onboarding/owner/terms
 *   - Signed in but not OWNER/ADMIN → redirect /dashboard (nothing to do)
 *   - Signed in OWNER who already accepted → redirect /dashboard (no replay)
 *   - Signed in OWNER who hasn't accepted → render the form
 */
export default async function OwnerTermsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?next=/onboarding/owner/terms')
  }
  if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Fresh read — the session may carry stale `ownerTermsAcceptedAt`
  // if the row was just updated in another tab.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { ownerTermsAcceptedAt: true, name: true },
  })
  if (user?.ownerTermsAcceptedAt) {
    redirect('/dashboard')
  }

  const locale = await getLocale()
  const t = getT(locale)
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? null

  return (
    <div className="mx-auto max-w-[720px] px-6 py-14 lg:py-20">
      <span aria-hidden className="block h-px w-12 bg-primary" />
      <span className="mt-5 inline-block text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
        {t('onboarding.owner.terms.eyebrow')}
      </span>
      <h1 className="mt-3.5 font-serif text-[clamp(28px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground text-balance">
        {firstName
          ? t('onboarding.owner.terms.title.named', { name: firstName })
          : t('onboarding.owner.terms.title')}
      </h1>
      <p className="mt-4 max-w-[560px] text-[15.5px] leading-[1.6] text-foreground/70">
        {t('onboarding.owner.terms.lead')}
      </p>

      {/* Critical 10% clause — highlighted block so it cannot be missed. */}
      <section className="mt-8 rounded-2xl border border-amber-300/60 bg-amber-50/70 p-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
          {t('onboarding.owner.terms.highlight.eyebrow')}
        </span>
        <h2 className="mt-2 font-serif text-[clamp(20px,2.2vw,26px)] font-normal leading-[1.2] tracking-[-0.018em] text-amber-950">
          {t('onboarding.owner.terms.highlight.title')}
        </h2>
        <p className="mt-3 text-[14.5px] leading-[1.55] text-amber-950/85">
          {t('onboarding.owner.terms.highlight.body')}
        </p>
      </section>

      <div className="mt-8">
        <Link
          href="/legal/terms-owner"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('onboarding.owner.terms.fullTextLink')}
        </Link>
      </div>

      <div className="mt-8">
        <OwnerTermsForm />
      </div>
    </div>
  )
}
