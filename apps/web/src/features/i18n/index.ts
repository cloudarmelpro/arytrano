/**
 * Public surface of the i18n feature (client-safe).
 *
 * Cross-feature consumers (web components like LocaleSwitcher, REST handlers
 * that update user.locale, etc.) MUST import from here — not from internal
 * paths like `features/i18n/actions/...` — per ARCHITECTURE rule 1.
 *
 * IMPORTANT: only re-export client-safe symbols here. `services/` modules
 * use `'server-only'`, which would poison the client bundle if any consumer
 * happens to be a Client Component (e.g. `LocaleSwitcher` is `'use client'`
 * and imports `setLocaleAction` from this index). Server-only services
 * stay internal — the Server Action that wraps them lives here as the
 * cross-runtime boundary.
 */
export { setLocaleAction } from './actions/set-locale'
