import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import {
  listWhatsAppAlerts,
  getAlertsStats,
} from '@/features/admin-alerts/server'
import { AlertsClient } from '@/features/admin-alerts'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export const metadata: Metadata = {
  title: 'Alertes WhatsApp · Admin AryTrano',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{
  cursor?: string
  quartier?: string
  locale?: string
}>

export default async function AdminWhatsAppAlertsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [sp, locale] = await Promise.all([searchParams, getLocale()])
  const t = getT(locale)

  const filters = {
    quartierSlug: sp.quartier,
    locale: sp.locale,
    cursor: sp.cursor,
  }

  const [page, stats, neighborhoods] = await Promise.all([
    listWhatsAppAlerts(filters),
    getAlertsStats(),
    prisma.neighborhood.findMany({
      select: { slug: true, nameFr: true },
      orderBy: { nameFr: 'asc' },
    }),
  ])

  const quartierOptions = neighborhoods.map((n) => ({
    value: n.slug,
    label: n.nameFr,
  }))

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-primary">
          {t('admin.alerts.page.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('admin.alerts.page.lead')}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <Kpi label={t('admin.alerts.kpi.total')} value={stats.total} />
        <Kpi
          label={t('admin.alerts.kpi.newThisWeek')}
          value={stats.newThisWeek}
        />
        <Kpi
          label={t('admin.alerts.kpi.locale')}
          value={`${stats.byLocale['fr-MG']} / ${stats.byLocale.mg}`}
          help="FR / MG"
        />
        <Kpi
          label={t('admin.alerts.kpi.unsubscribed')}
          value={stats.unsubscribed}
        />
      </section>

      <AlertsClient
        items={page.items}
        nextCursor={page.nextCursor}
        hasMore={page.hasMore}
        total={page.total}
        filters={{ quartierSlug: sp.quartier, locale: sp.locale }}
        quartierOptions={quartierOptions}
      />

      <p className="text-[12.5px] leading-[1.55] text-muted-foreground">
        {t('admin.alerts.privacy')}
      </p>
    </div>
  )
}

function Kpi({
  label,
  value,
  help,
}: {
  label: string
  value: number | string
  help?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-muted/40 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-[22px] font-semibold leading-none text-foreground">
        {value}
      </p>
      {help ? (
        <p className="mt-0.5 text-[11.5px] text-muted-foreground/80">{help}</p>
      ) : null}
    </div>
  )
}
