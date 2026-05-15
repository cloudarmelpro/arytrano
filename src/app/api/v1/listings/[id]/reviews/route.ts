import { makeListReviewsHandler } from '@/features/reviews/api/list'
import { makeSubmitReviewHandler } from '@/features/reviews/api/submit'

export const GET = makeListReviewsHandler()
export const POST = makeSubmitReviewHandler()
