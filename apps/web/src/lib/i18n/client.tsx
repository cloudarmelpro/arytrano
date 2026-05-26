'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Locale } from './config'
import type { MessageKey, Messages } from './messages/types'

/**
 * Inlined translator factory + type. PERF-H1 audit fix — we duplicate
 * `makeTranslator` here (4 lines of logic) rather than import from
 * `./translate`, because that module re-exports `getT` from
 * `./messages/index.ts`, which statically imports BOTH locale
 * dictionaries (~270 KB raw, 65 KB gzipped). Inlining cuts the import
 * chain so neither dictionary leaks into the client bundle.
 *
 * Server-side `getT(locale)` (in `./translate`) is unaffected — it
 * still loads the active locale's dictionary at request time on the
 * Node runtime and passes it down via the `messages` prop below.
 */
export type Translator = <K extends MessageKey>(
  key: K,
  params?: Record<string, string | number>,
) => string

function makeTranslator(messages: Messages): Translator {
  return (key, params) => {
    const raw = messages[key]
    if (!params) return raw
    return raw.replace(/\{(\w+)\}/g, (_, name) =>
      Object.hasOwn(params, name) ? String(params[name]) : `{${name}}`,
    )
  }
}

type LocaleContextValue = {
  locale: Locale
  t: Translator
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

/**
 * Wraps client components with the current locale + a memoized translator.
 * Mounted once in the root layout (server) with the resolved locale + the
 * active-locale dictionary as a prop.
 */
export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: ReactNode
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, t: makeTranslator(messages) }),
    [locale, messages],
  )
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

/** `useLocale()` returns `{ locale, t }` for any client component. */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used inside <LocaleProvider>')
  }
  return ctx
}

/** Sugar — most components only need `t`. */
export function useT(): Translator {
  return useLocale().t
}
