// PERF-H1 audit fix — this module statically imports BOTH locale
// dictionaries and is therefore SERVER-ONLY. Client components must
// either go through the `useT()` context (fed by the active-locale
// dictionary passed as a prop in the root layout) or import strictly
// types from `./types.ts`. The `'server-only'` import fails the build
// if any client component tries to reach this file at runtime.
import 'server-only'
import type { Locale } from '../config'
import { frMG } from './fr-MG'
import { mg } from './mg'
import { makeTranslator, type Translator } from '../translate'
import type { MessageKey, Messages } from './types'

const MESSAGES: Record<Locale, Messages> = {
  'fr-MG': frMG,
  mg,
}

export type { MessageKey, Messages } from './types'

export function getMessagesFor(locale: Locale): Messages {
  return MESSAGES[locale]
}

/** Server-side translator factory. Loads the active-locale dictionary
 *  at request time on the Node runtime. Re-exported via `./translate`
 *  for the 98 server callers that import `getT` from there. */
export function getT(locale: Locale): Translator {
  return makeTranslator(getMessagesFor(locale))
}
