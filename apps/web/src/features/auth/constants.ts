/**
 * Shared auth constants. Lives in a plain TS module (NOT a 'use server' file)
 * so it can export non-function values — Next.js rejects any non-async export
 * from files marked with `'use server'` at module level.
 */

/**
 * Cookie that bridges the role chosen on the sign-up page to the OAuth
 * callback. Set in the sign-up Server Action before the OAuth round-trip;
 * read by `events.createUser` in `auth.ts`.
 */
export const SIGNUP_ROLE_COOKIE_NAME = 'arytrano_signup_role'
