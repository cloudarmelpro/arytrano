/**
 * Server-only surface of the `auth` feature.
 *
 * Re-exports services and queries that hit Prisma. Importing this
 * file from a Client Component is a compile error (modules import
 * `'server-only'`).
 *
 * RSC components / pages: `import { ... } from '@/features/auth/server'`.
 * Auth.js handlers, schemas, client form components and signOutAction
 * stay on the main `@/features/auth` index.
 */
export { getProfile } from './services/update-profile'
export {
  listConnections,
  countAuthMethods,
  type ConnectionSummary,
} from './services/connections'
export {
  listLoginEvents,
  type LoginEventView,
} from './services/list-login-events'
export {
  countActiveRecoveryCodes,
  isTotpEnabled,
} from './services/totp'
export {
  getCinStatus,
  type CinStatus,
} from './services/submit-cin'
