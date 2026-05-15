import type { Translator } from '@/lib/i18n/translate'
import type { PublicReview } from '../queries/list-listing-reviews'
import type { ReviewReactionSnapshot } from '../queries/get-review-reactions'
import { ReviewRow } from './ReviewRow'

const ZERO_REACTIONS: ReviewReactionSnapshot = { likes: 0, dislikes: 0, mine: null }

/**
 * Server-rendered list of reviews on the detail page. Each row delegates
 * its own interactivity (edit / delete / reactions / owner response) to
 * the client `<ReviewRow>` component.
 */
export function ReviewList({
  reviews,
  t,
  canRespond,
  currentUserId,
  ownerName,
  ownerImage,
  reactions,
}: {
  reviews: PublicReview[]
  /** Unused here — kept for prop parity with prior signature. */
  t: Translator
  /** Current viewer is the listing owner. */
  canRespond: boolean
  /** Used to gate edit/delete to the author. */
  currentUserId: string | null
  ownerName: string
  ownerImage: string | null
  /** Map of reviewId → snapshot, batch-loaded by the page. */
  reactions: Map<string, ReviewReactionSnapshot>
}) {
  void t

  if (reviews.length === 0) return null

  return (
    <ul className="flex flex-col gap-8">
      {reviews.map((r) => (
        <ReviewRow
          key={r.id}
          review={r}
          isMine={currentUserId !== null && r.authorId === currentUserId}
          canRespond={canRespond}
          ownerName={ownerName}
          ownerImage={ownerImage}
          dateFormatLocale="fr-FR"
          initialReactions={reactions.get(r.id) ?? ZERO_REACTIONS}
        />
      ))}
    </ul>
  )
}
