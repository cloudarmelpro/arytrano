'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/client'
import { toggleListingVerifiedAction } from '../actions/verify-listing'

/**
 * Admin "Vérifier / Retirer la vérif" toggle button (T-033).
 * Reads the current `verifiedAt` state from the parent (the admin grid
 * passes the row's value) and dispatches the matching action.
 */
export function VerifyListingButton({
  listingId,
  verifiedAt,
}: {
  listingId: string
  verifiedAt: Date | null
}) {
  const t = useT()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const isVerified = Boolean(verifiedAt)

  function onClick() {
    startTransition(async () => {
      const result = await toggleListingVerifiedAction(
        listingId,
        isVerified ? 'unverify' : 'verify',
      )
      if (result.ok) {
        toast.success(
          result.verified
            ? t('admin.listings.verify.toast.verified')
            : t('admin.listings.verify.toast.unverified'),
        )
        router.refresh()
      } else {
        toast.error(result.message ?? t('admin.listings.verify.toast.error'))
      }
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={isVerified}
      className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isVerified
          ? 'bg-primary/10 text-primary hover:bg-primary/15'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <ShieldIcon filled={isVerified} />
      {isVerified
        ? t('admin.listings.unverify.cta')
        : t('admin.listings.verify.cta')}
    </button>
  )
}

function ShieldIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      {!filled && <path d="m9 12 2 2 4-4" />}
    </svg>
  )
}
