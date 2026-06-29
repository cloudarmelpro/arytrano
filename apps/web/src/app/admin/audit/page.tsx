import type { Metadata } from 'next'
import Link from 'next/link'
import { listAuditLogs, listAuditTargetTypes } from '@/features/audit/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Journal d’audit — Admin',
  robots: { index: false, follow: false },
}

const ACTION_BADGE: Record<string, string> = {
  verify: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  unverify: 'bg-slate-100 text-slate-600 border-slate-200',
  suspend: 'bg-rose-50 text-rose-700 border-rose-200',
  reject: 'bg-rose-50 text-rose-700 border-rose-200',
  approve: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  resolve: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  dismiss: 'bg-slate-100 text-slate-600 border-slate-200',
  claim: 'bg-amber-50 text-amber-800 border-amber-200',
  convert: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  transition: 'bg-violet-50 text-violet-800 border-violet-200',
}

function badgeFor(action: string): string {
  const verb = action.split('.').pop() ?? ''
  return ACTION_BADGE[verb] ?? 'bg-slate-100 text-slate-700 border-slate-200'
}

function fmt(d: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string
    targetType?: string
    cursor?: string
  }>
}) {
  const sp = await searchParams
  const [{ rows, nextCursor }, targetTypes] = await Promise.all([
    listAuditLogs({
      action: sp.action,
      targetType: sp.targetType,
      cursor: sp.cursor,
    }),
    listAuditTargetTypes(),
  ])

  const baseQuery = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    if (sp.action) params.set('action', sp.action)
    if (sp.targetType) params.set('targetType', sp.targetType)
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === '') params.delete(k)
      else params.set(k, v)
    }
    const s = params.toString()
    return s ? `/admin/audit?${s}` : '/admin/audit'
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Journal d’audit</h1>
        <p className="text-sm text-muted-foreground">
          Trace append-only de toutes les actions admin privilégiées.
          Lecture seule — les rows ne peuvent jamais être modifiées depuis
          l’app.
        </p>
      </header>

      <form
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/30 p-4"
        method="GET"
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-foreground/70">
          Action
          <input
            type="text"
            name="action"
            defaultValue={sp.action ?? ''}
            placeholder="listing.verify"
            className="h-9 w-56 rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-foreground/70">
          Entité
          <select
            name="targetType"
            defaultValue={sp.targetType ?? ''}
            className="h-9 w-48 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">Toutes</option>
            {targetTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Filtrer
        </button>
        {(sp.action || sp.targetType) && (
          <Link
            href="/admin/audit"
            className="inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-sm hover:bg-muted"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Action</th>
              <th className="px-3 py-2 font-medium">Cible</th>
              <th className="px-3 py-2 font-medium">Admin</th>
              <th className="px-3 py-2 font-medium">Détails</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-12 text-center text-muted-foreground"
                >
                  Aucune entrée pour ces filtres.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-border align-top hover:bg-muted/20"
                >
                  <td className="whitespace-nowrap px-3 py-2 text-foreground/70">
                    {fmt(row.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] ${badgeFor(
                        row.action,
                      )}`}
                    >
                      {row.action}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-foreground">{row.targetType}</div>
                    <div className="font-mono text-[11px] text-foreground/55">
                      {row.targetId}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {row.admin ? (
                      <div>
                        <div className="text-foreground">{row.admin.name ?? '—'}</div>
                        <div className="text-[11px] text-foreground/55">{row.admin.email}</div>
                      </div>
                    ) : (
                      <span className="italic text-foreground/40">supprimé</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-foreground/70">
                    {row.metadata
                      ? (
                        <pre className="max-w-md whitespace-pre-wrap break-words font-mono text-[11px]">
                          {JSON.stringify(row.metadata, null, 0)}
                        </pre>
                      )
                      : (
                        <span className="text-foreground/40">—</span>
                      )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {nextCursor && (
        <div className="flex justify-end">
          <Link
            href={baseQuery({ cursor: nextCursor })}
            className="inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-sm hover:bg-muted"
          >
            Page suivante →
          </Link>
        </div>
      )}
    </div>
  )
}
