import type { Locale } from '../config'
import { frMG, type MessageKey } from './fr-MG'
import { mg } from './mg'

/** Plain string lookup — fr-MG's literal types would otherwise reject mg's values. */
export type Messages = Record<MessageKey, string>

const MESSAGES: Record<Locale, Messages> = {
  'fr-MG': frMG,
  mg,
}

export type { MessageKey } from './fr-MG'

export function getMessagesFor(locale: Locale): Messages {
  return MESSAGES[locale]
}
