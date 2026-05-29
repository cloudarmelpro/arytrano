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

/**
 * Current version identifier of the Owner Terms. Stored on
 * `User.ownerTermsVersion` so we can re-prompt when this string changes
 * (e.g. a meaningful clause edit) without resetting the timestamp for
 * users who already accepted an older version.
 *
 * Bump the date on every legally meaningful edit of the Owner Terms.
 */
export const OWNER_TERMS_VERSION = '2026-05-29'

/** Onboarding route path — referenced by the dashboard gate and the
 *  sign-up flows. Single source of truth. */
export const OWNER_TERMS_ONBOARDING_PATH = '/onboarding/owner/terms'
