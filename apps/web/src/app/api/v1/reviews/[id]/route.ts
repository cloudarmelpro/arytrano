import {
  makeDeleteReviewHandler,
  makeUpdateReviewHandler,
} from '@/features/reviews/api/manage'

export const PATCH = makeUpdateReviewHandler()
export const DELETE = makeDeleteReviewHandler()
