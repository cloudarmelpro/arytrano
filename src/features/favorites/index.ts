/**
 * Public surface of the favorites feature (client-safe).
 *
 * Service modules use `import 'server-only'` and stay internal — exporting
 * them here would poison the client bundle (see memory rule
 * `feedback_feature_index_client_safe.md`).
 */
export { toggleFavoriteAction } from './actions/toggle-favorite'
export { FavoriteButton } from './components/FavoriteButton'
