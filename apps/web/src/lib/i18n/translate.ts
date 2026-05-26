import type { MessageKey, Messages } from './messages/types'

/**
 * Translation function: `t(key, params?)`.
 *
 * - `key` is constrained to the FR-MG dictionary's keys (the source of truth).
 * - `params` is an object with placeholder replacements; e.g. for the message
 *   `'annonces.count.one': '{count} annonce'`, call `t('annonces.count.one', { count: 1 })`.
 *
 * Placeholders are simple `{name}` markers; no fancy ICU plural / gender — we
 * pre-compute the plural by selecting the right key (`.one` / `.other`) at the
 * call site. Keeps the runtime tiny and the translations explicit.
 *
 * PERF-H1 audit note — this module imports ONLY types from `messages/`,
 * never the actual dictionaries. The runtime `getT(locale)` helper lives
 * in `messages/index.ts` (server-only path) so the client bundle does
 * not pull in fr-MG.ts + mg.ts via the translator import chain.
 */
export type Translator = <K extends MessageKey>(
  key: K,
  params?: Record<string, string | number>,
) => string

export function makeTranslator(messages: Messages): Translator {
  return (key, params) => {
    const raw = messages[key]
    if (!params) return raw
    // Use Object.hasOwn (NOT `in`) so prototype-chain props like `toString`
    // can't pollute placeholder lookup if a caller ever passes an externally-
    // sourced params object.
    return raw.replace(/\{(\w+)\}/g, (_, name) =>
      Object.hasOwn(params, name) ? String(params[name]) : `{${name}}`,
    )
  }
}

export { getT } from './messages'
