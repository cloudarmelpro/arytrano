import 'server-only'

/**
 * Escape Postgres ILIKE/LIKE metacharacters in user input before
 * Prisma wraps it in `%...%` for `contains`/`startsWith`/`endsWith`
 * queries. Prevents two attacks:
 *
 *  1. Wildcard expansion : `q=%` matches every row (intent confusion).
 *  2. ReDoS via repeated wildcards : `q=%%%%...%%%%` triggers
 *     exponential backtracking inside `ILIKE` on large TEXT columns
 *     (effective DoS on unindexed `description`).
 *
 * Backslash is the default Postgres LIKE escape character. We escape
 * `\` first so the backslashes we add for `%`/`_` don't get double-escaped.
 *
 * Use anywhere user-supplied strings flow into a Prisma `contains` /
 * `startsWith` / `endsWith` filter.
 */
export function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (c) => '\\' + c)
}
