'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/client'
import { reactToReviewAction } from '../actions/react-to-review'
import type { ReviewReactionSnapshot } from '../queries/get-review-reactions'

type Kind = 'LIKE' | 'DISLIKE'

/**
 * Facebook-style reaction bar shown under each review:
 *
 *   👍 J'aime · 12     👎 J'aime pas · 1     Répondre
 *
 * The reaction-bar click is optimistic: we flip the active state and bump
 * the count locally before awaiting the Server Action. On failure we
 * roll back and surface a toast.
 *
 * Anonymous click → redirect to `/sign-in?returnTo=…` so the user can
 * react after authenticating.
 */
export function ReviewReactions({
  reviewId,
  initial,
}: {
  reviewId: string
  initial: ReviewReactionSnapshot
}) {
  const t = useT()
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<ReviewReactionSnapshot>(initial)
  const [pending, startTransition] = useTransition()

  function clickReaction(target: Kind) {
    if (pending) return
    const previous = state
    // Toggle: clicking the active button removes the reaction; otherwise
    // switch / set to the target.
    const nextKind: Kind | null = state.mine === target ? null : target
    const optimistic: ReviewReactionSnapshot = {
      likes:
        state.likes -
        (state.mine === 'LIKE' ? 1 : 0) +
        (nextKind === 'LIKE' ? 1 : 0),
      dislikes:
        state.dislikes -
        (state.mine === 'DISLIKE' ? 1 : 0) +
        (nextKind === 'DISLIKE' ? 1 : 0),
      mine: nextKind,
    }
    setState(optimistic)

    startTransition(async () => {
      const result = await reactToReviewAction(reviewId, nextKind)
      if (result.ok && result.state) {
        // Server is authoritative — overwrite with the fresh snapshot.
        setState(result.state)
        return
      }
      // Roll back optimistic update.
      setState(previous)
      if (result.needsAuth) {
        const returnTo = encodeURIComponent(pathname)
        router.push(`/sign-in?returnTo=${returnTo}`)
        return
      }
      toast.error(result.message ?? t('reviews.reactions.error'))
    })
  }

  return (
    <div className="flex items-center gap-1 pl-1 text-xs">
      <ReactionButton
        active={state.mine === 'LIKE'}
        count={state.likes}
        disabled={pending}
        onClick={() => clickReaction('LIKE')}
        ariaLabel={
          state.mine === 'LIKE'
            ? t('reviews.reactions.like.remove')
            : t('reviews.reactions.like.add')
        }
        icon={<ThumbsUpIcon filled={state.mine === 'LIKE'} />}
        label={t('reviews.reactions.like.label')}
        tone="primary"
      />
      <ReactionButton
        active={state.mine === 'DISLIKE'}
        count={state.dislikes}
        disabled={pending}
        onClick={() => clickReaction('DISLIKE')}
        ariaLabel={
          state.mine === 'DISLIKE'
            ? t('reviews.reactions.dislike.remove')
            : t('reviews.reactions.dislike.add')
        }
        icon={<ThumbsDownIcon filled={state.mine === 'DISLIKE'} />}
        label={t('reviews.reactions.dislike.label')}
        tone="destructive"
      />
    </div>
  )
}

function ReactionButton({
  active,
  count,
  disabled,
  onClick,
  ariaLabel,
  icon,
  label,
  tone,
}: {
  active: boolean
  count: number
  disabled: boolean
  onClick: () => void
  ariaLabel: string
  icon: React.ReactNode
  label: string
  tone: 'primary' | 'destructive'
}) {
  const activeClasses =
    tone === 'primary'
      ? 'text-primary'
      : 'text-destructive'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 ${
        active ? activeClasses : 'text-muted-foreground'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span className={active ? '' : 'text-foreground'}>{count}</span>
      )}
    </button>
  )
}

function ThumbsUpIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L14 2a3.13 3.13 0 0 1 1 4z" />
    </svg>
  )
}

function ThumbsDownIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L10 22a3.13 3.13 0 0 1-1-4z" />
    </svg>
  )
}
