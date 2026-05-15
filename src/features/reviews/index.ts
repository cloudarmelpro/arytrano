/**
 * Public surface of the reviews feature (client-safe). Services with
 * `import 'server-only'` stay internal — see memory rule
 * `feedback_feature_index_client_safe.md`.
 */
export { ReviewForm } from './components/ReviewForm'
export { ReviewList } from './components/ReviewList'
export { StarRating } from './components/StarRating'
