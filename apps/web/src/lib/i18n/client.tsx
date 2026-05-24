'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Locale } from './config'
import { makeTranslator, type Translator } from './translate'
import { getMessagesFor } from './messages'

type LocaleContextValue = {
  locale: Locale
  t: Translator
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

/**
 * Wraps client components with the current locale + a memoized translator.
 * Mounted once in the root layout (server) with the resolved locale.
 */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, t: makeTranslator(getMessagesFor(locale)) }),
    [locale],
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
