import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Locale } from '@arytrano/shared'
import { buildTranslator, type Translator } from './messages'
import { readLocale, writeLocale } from './store'

const LOCALE_QUERY_KEY = ['i18n', 'locale'] as const

/**
 * Read + write the active locale.
 *
 * Backed by TanStack Query so every component that calls `useLocale`
 * shares the same cache entry. `setLocale` writes to SecureStore and
 * invalidates the cache, which forces every consumer to re-render with
 * the new value.
 */
export function useLocale() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: LOCALE_QUERY_KEY,
    queryFn: readLocale,
    staleTime: Infinity,
  })

  const mutation = useMutation({
    mutationFn: async (next: Locale) => {
      await writeLocale(next)
      return next
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOCALE_QUERY_KEY })
    },
  })

  // `fr-MG` is the safe default while the query resolves — matches the
  // server side which assumes FR-MG when the header is absent.
  const locale: Locale = query.data ?? 'fr-MG'

  return { locale, setLocale: mutation.mutate }
}

/**
 * Shortcut that returns the translator bound to the current locale.
 * Components use this 99% of the time — only the locale picker needs
 * the `setLocale` setter.
 */
export function useT(): Translator {
  const { locale } = useLocale()
  return buildTranslator(locale)
}
