import 'server-only'

/**
 * Canonical cuid-shape guard for `:id` path params in REST handlers.
 *
 * Audit P2-1 : 4 different handlers had each redeclared
 * `/^[a-z0-9]{20,40}$/` (15-char tolerance vs the strict cuid 25 char
 * length). Centralizing here AND tightening to {24,30} bounds the
 * accepted range to the real Prisma cuid shape — defends against
 * path-traversal pivots and enumeration mutants that previously
 * sailed past the looser regex.
 *
 * Use via `cuidRegex.test(id)` in handlers OR (recommended) the
 * `assertCuidShape(id)` helper that throws `errors.notFound` on
 * failure, matching the anti-leak 404 policy.
 */

import { errors } from './errors'

export const cuidRegex = /^[a-z0-9]{24,30}$/

/**
 * Throws `errors.notFound` if the id doesn't look like a cuid.
 * Use BEFORE the DB round-trip so a malformed id 404s immediately
 * (anti-enumeration : indistinguishable from "exists but not yours").
 */
export function assertCuidShape(id: string, label = 'Not found'): void {
  if (!cuidRegex.test(id)) {
    throw errors.notFound(label)
  }
}
