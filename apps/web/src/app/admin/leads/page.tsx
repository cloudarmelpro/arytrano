import Link from 'next/link'
import { auth } from '@/features/auth'
import { listLeadsForOperator } from '@/features/leads/server'
import { ClaimLeadButton } from '@/features/leads/components/ClaimLeadButton'
import { formatAriary } from '@/lib/format/currency'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-800 border-blue-200',
  CLAIMED: 'bg-amber-50 text-amber-800 border-amber-200',
  IN_DISCUSSION: 'bg-violet-50 text-violet-800 border-violet-200',
  AWAITING_OWNER: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  AWAITING_TENANT: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  CONVERTED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  LAPSED: 'bg-slate-100 text-slate-600 border-slate-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
}

function fmtRelative(d: Date | null): string {
  if (!d) return '—'
  const diffMs = Date.now() - d.getTime()
  const abs = Math.abs(diffMs)
  const m = Math.round(abs / 60000)
  if (m < 1) return diffMs > 0 ? 'à l’instant' : '< 1 min'
  if (m < 60) return diffMs > 0 ? `${m}m` : `dans ${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return diffMs > 0 ? `${h}h` : `dans ${h}h`
  const days = Math.round(h / 24)
  return diffMs > 0 ? `${days}j` : `dans ${days}j`
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; me?: string }>
}) {
  const session = await auth()
  const operatorId = session!.user!.id // gated by /admin layout

  const sp = await searchParams
  const status = sp.status as
    | 'NEW'
    | 'CLAIMED'
    | 'IN_DISCUSSION'
    | 'CONVERTED'
    | 'LAPSED'
    | 'REJECTED'
    | undefined
  const claimedByMe = sp.me === '1'

  const leads = await listLeadsForOperator({
    operatorId,
    status: status ?? 'ALL_OPEN',
    claimedByMe,
  })

  const filterChip = (label: string, href: string, active: boolean) => (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[12.5px] font-medium transition ${
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
        <h1 className="text-[24px] font-bold leading-tight tracking-tight">
          Leads
        </h1>
        <p className="mt-1 text-[13.5px] text-foreground/70">
          Queue concierge — file d’attente E-T28. WIP cap = 6 par opérateur.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {filterChip('Tous ouverts', '/admin/leads', !status && !claimedByMe)}
        {filterChip(
          'Mes leads',
          '/admin/leads?me=1',
          claimedByMe && !status,
        )}
        {filterChip('NEW', '/admin/leads?status=NEW', status === 'NEW')}
        {filterChip(
          'CLAIMED',
          '/admin/leads?status=CLAIMED',
          status === 'CLAIMED',
        )}
        {filterChip(
          'IN_DISCUSSION',
          '/admin/leads?status=IN_DISCUSSION',
          status === 'IN_DISCUSSION',
        )}
        {filterChip(
          'CONVERTED',
          '/admin/leads?status=CONVERTED',
          status === 'CONVERTED',
        )}
      </div>

      {leads.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-sm font-medium">Aucun lead correspondant.</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Les nouveaux leads remontent ici dès qu’un visiteur soumet le
            formulaire « Je suis intéressé(e) » sur une annonce.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full text-left text-[13.5px]">
            <thead className="border-b border-border bg-muted/30 text-[11.5px] uppercase tracking-[0.06em] text-foreground/60">
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Annonce</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Opérateur</th>
                <th className="px-4 py-3">SLA</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="font-semibold text-foreground hover:text-primary"
                    >
                      {l.tenantName}
                    </Link>
                    <div className="text-[12px] text-foreground/60">
                      {l.tenantPhone} · {l.moveInWindow}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{l.listing.title}</div>
                    <div className="text-[12px] text-foreground/60">
                      {l.listing.city.nameFr} · {l.listing.neighborhood.nameFr} ·{' '}
                      {formatAriary(l.listing.priceMonthlyMGA)}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-[0.04em] ${STATUS_BADGE[l.status] ?? ''}`}
                    >
                      {l.status}
                    </span>
                    <div className="mt-1 text-[12px] text-foreground/60">
                      créé {fmtRelative(l.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-[13px]">
                    {l.claimedBy ? l.claimedBy.name ?? '?' : '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-[13px]">
                    {l.slaDueAt ? fmtRelative(l.slaDueAt) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    {l.status === 'NEW' ? (
                      <ClaimLeadButton leadId={l.id} />
                    ) : (
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="text-[12.5px] font-medium text-primary hover:underline"
                      >
                        Ouvrir →
                      </Link>
                    )}
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
