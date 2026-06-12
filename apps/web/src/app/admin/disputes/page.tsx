import type { Metadata } from 'next'
import Link from 'next/link'
import { listDisputesForAdmin } from '@/features/disputes/server'
import { formatAriary } from '@/lib/format/currency'

export const dynamic = 'force-dynamic'

// Explicit page-level noindex — the admin layout already sets it
// but we don't want to rely on inheritance for sensitive surfaces
// (audit fix 2026-06-12).
export const metadata: Metadata = {
  title: 'Litiges — Admin',
  robots: { index: false, follow: false },
}

const STATUS_BADGE: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-800 border-blue-200',
  IN_REVIEW: 'bg-amber-50 text-amber-800 border-amber-200',
  RESOLVED_OWNER: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  RESOLVED_TENANT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  RESOLVED_SPLIT: 'bg-slate-100 text-slate-700 border-slate-200',
  WITHDRAWN: 'bg-slate-100 text-slate-600 border-slate-200',
}

// A11y audit fix (2026-06-12) — render a human label so screen
// readers + colour-blind users can tell RESOLVED_OWNER apart from
// RESOLVED_TENANT (which shared identical green styling).
const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Ouvert',
  IN_REVIEW: 'En revue',
  RESOLVED_OWNER: 'Résolu — propriétaire',
  RESOLVED_TENANT: 'Résolu — locataire',
  RESOLVED_SPLIT: 'Résolu — partagé',
  WITHDRAWN: 'Retiré',
}

function fmtRelative(d: Date | null): string {
  if (!d) return '—'
  const diffMs = d.getTime() - Date.now()
  const abs = Math.abs(diffMs)
  const h = Math.round(abs / 3_600_000)
  if (h < 24) return diffMs > 0 ? `dans ${h}h` : `il y a ${h}h`
  const days = Math.round(h / 24)
  return diffMs > 0 ? `dans ${days}j` : `il y a ${days}j`
}

export default async function AdminDisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const status = (sp.status as 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'ALL' | undefined) ?? 'ALL'
  const disputes = await listDisputesForAdmin({ status })

  const chip = (label: string, href: string, active: boolean) => (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[12.5px] font-medium ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground/80 hover:border-primary/40'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[24px] font-bold tracking-tight">Litiges</h1>
        <p className="mt-1 text-[13.5px] text-foreground/70">
          Arbitrage caution E-T27.3 — SLA 7 jours. Avis non contraignant.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {chip('Ouverts', '/admin/disputes', status === 'ALL')}
        {chip('À triager', '/admin/disputes?status=OPEN', status === 'OPEN')}
        {chip('En revue', '/admin/disputes?status=IN_REVIEW', status === 'IN_REVIEW')}
        {chip('Résolus', '/admin/disputes?status=RESOLVED', status === 'RESOLVED')}
      </div>

      {disputes.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-sm font-medium">Aucun litige pour ce filtre.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full text-left text-[13.5px]">
            <thead className="border-b border-border bg-muted/30 text-[11.5px] uppercase tracking-[0.06em] text-foreground/60">
              <tr>
                <th scope="col" className="px-4 py-3">Bail</th>
                <th scope="col" className="px-4 py-3">Ouvert par</th>
                <th scope="col" className="px-4 py-3">Montant</th>
                <th scope="col" className="px-4 py-3">Statut</th>
                <th scope="col" className="px-4 py-3">SLA</th>
                <th scope="col" className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/disputes/${d.id}`}
                      className="font-semibold hover:text-primary"
                    >
                      {d.lease.listing.title}
                    </Link>
                    <div className="text-[12px] text-foreground/60">
                      {d.lease.owner.name ?? '—'} ↔ {d.lease.tenant.name ?? '—'} ·{' '}
                      Loyer {formatAriary(d.lease.monthlyRentMGA)}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex items-center rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px] uppercase tracking-[0.04em]">
                      {d.openedByRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top font-mono">
                    {formatAriary(d.amountAtStakeMGA)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-[0.04em] ${STATUS_BADGE[d.status] ?? ''}`}
                    >
                      {STATUS_LABEL[d.status] ?? d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-[12.5px] text-foreground/70">
                    {fmtRelative(d.slaDueAt)}
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    <Link
                      href={`/admin/disputes/${d.id}`}
                      className="text-[12.5px] font-medium text-primary hover:underline"
                    >
                      Ouvrir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
