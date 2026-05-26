/**
 * Client-safe types for i18n message dictionaries.
 *
 * PERF-H1 audit fix — this file is the ONLY one the client provider
 * (`lib/i18n/client.tsx`) is allowed to import from `messages/`. The
 * actual dictionaries (`fr-MG.ts`, `mg.ts`) and the loader
 * (`index.ts`) stay server-only so the bundler doesn't pull both
 * locales into every client bundle (~270 KB raw, 65 KB gzipped).
 *
 * `MessageKey` is the literal union of every key from the source-of-truth
 * dictionary (`fr-MG`). It cannot be exported from `fr-MG.ts` directly
 * without also importing the dictionary, which defeats the split — so
 * we duplicate the type derivation hop via a `keyof` indirection that
 * the bundler can erase.
 */
import type { frMG } from './fr-MG'

export type MessageKey = keyof typeof frMG
export type Messages = Record<MessageKey, string>
