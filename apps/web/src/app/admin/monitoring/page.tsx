import type { Metadata } from 'next'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Monitoring — Admin',
  robots: { index: false, follow: false },
}

/**
 * ADM-13 — Sentry deep-link page.
 *
 * Sentry doesn't let arbitrary iframes embed the dashboard (X-Frame
 * Options=DENY), so the "intégré" requirement collapses to a
 * predictable set of deep-links the admin can land on with one click.
 * We surface: Issues (default unresolved filter), Performance, Replays,
 * Crons. The URLs are stable enough that we generate them from the
 * SENTRY_ORG_SLUG + SENTRY_PROJECT_SLUG env pair.
 */
export default async function AdminMonitoringPage() {
  const orgSlug = env.SENTRY_ORG_SLUG
  const projectSlug = env.SENTRY_PROJECT_SLUG
  const configured = Boolean(orgSlug && projectSlug)

  const links = configured
    ? [
        {
          label: 'Issues (non résolues)',
          href: `https://sentry.io/organizations/${orgSlug}/issues/?project=&query=is:unresolved`,
          hint: 'Erreurs ouvertes, triées par fréquence',
        },
        {
          label: 'Performance',
          href: `https://sentry.io/organizations/${orgSlug}/performance/`,
          hint: 'p50 / p75 / p95 par transaction, web vitals',
        },
        {
          label: 'Replays',
          href: `https://sentry.io/organizations/${orgSlug}/replays/`,
          hint: 'Sessions à la demande (désactivé par défaut)',
        },
        {
          label: 'Crons',
          href: `https://sentry.io/organizations/${orgSlug}/crons/`,
          hint: 'Jobs daily / hourly avec alertes manquantes',
        },
        {
          label: 'Releases',
          href: `https://sentry.io/organizations/${orgSlug}/releases/?project=`,
          hint: 'Suivi par tag git — utile après un déploiement',
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          Liens directs vers les vues Sentry — Sentry refuse l’embed iframe,
          donc on s’aligne sur des deep-links contextualisés.
        </p>
      </header>

      {!configured ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Sentry pas encore configuré.</p>
          <p className="mt-1">
            Renseigne <code>SENTRY_ORG_SLUG</code> et{' '}
            <code>SENTRY_PROJECT_SLUG</code> dans <code>app.env</code> pour
            faire apparaître les raccourcis. Le SDK lui-même fonctionne sans —
            seuls les deep-links de cette page en dépendent.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                className="block rounded-lg border border-border bg-muted/30 p-4 transition hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {l.label}
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{l.hint}</p>
              </a>
            </li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-background p-5">
        <h2 className="text-base font-semibold text-foreground">Healthcheck</h2>
        <p className="text-xs text-muted-foreground">
          La route publique <code>/api/health</code> renvoie le statut DB +
          l’âge du dernier backup. UptimeRobot s’en sert pour les alertes hors
          Sentry.
        </p>
        <a
          href="/api/health"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium hover:bg-muted/60"
        >
          Voir /api/health
        </a>
      </section>
    </div>
  )
}
