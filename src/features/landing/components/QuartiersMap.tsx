import type { Locale } from '@/lib/i18n/config'
import type { QuartierRow } from '../queries/get-quartiers-data'
import { QuartiersMapClient } from './QuartiersMapClient'

export function QuartiersMap({
  locale,
  quartiers,
}: {
  locale: Locale
  quartiers: QuartierRow[]
}) {
  return (
    <section className="bg-background pb-8">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <QuartiersMapClient locale={locale} quartiers={quartiers} />
      </div>
    </section>
  )
}
