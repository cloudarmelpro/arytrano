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
