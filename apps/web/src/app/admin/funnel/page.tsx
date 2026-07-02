import type { Metadata } from 'next'
import { computeConversionFunnel } from '@/features/admin/queries/compute-conversion-funnel'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Conversion funnel — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminFunnelPage() {
  const f = await computeConversionFunnel(60)
  const steps = [
    { label: 'Vues d’annonces', value: f.views },
    { label: 'Clics contact', value: f.contacts },
    { label: 'Leads soumis', value: f.leads },
    { label: 'Baux initiés', value: f.leasesInitiated },
    { label: 'Baux activés', value: f.leasesActive },
  ]
  const max = Math.max(...steps.map((s) => s.value), 1)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Conversion funnel — 60 derniers jours
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue → contact → lead → bail. Chaque marche = un signal de
          drop-off à investiguer.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {steps.map((s, i) => {
          const pct = Math.round((s.value / max) * 100)
          const prevValue = i > 0 ? steps[i - 1]!.value : null
          const dropoff =
            prevValue !== null && prevValue > 0
              ? Math.round(((prevValue - s.value) / prevValue) * 100)
              : null
          return (
            <li key={s.label} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-foreground">{s.label}</span>
                <span className="font-mono text-foreground/85">
                  {s.value.toLocaleString('fr-FR')}
                  {dropoff !== null && dropoff > 0 && (
                    <span className="ml-2 text-[11px] text-destructive">
                      −{dropoff}%
                    </span>
                  )}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
