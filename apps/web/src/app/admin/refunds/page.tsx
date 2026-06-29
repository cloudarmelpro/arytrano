import type { Metadata } from 'next'
import { listPendingRefunds } from '@/features/payments/server'
import { formatAriary } from '@/lib/format/currency'
import { EmptyState } from '@/components/shared/EmptyState'
import { MarkRefundedRow } from '@/features/payments/components/MarkRefundedRow'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Remboursements — Admin',
  robots: { index: false, follow: false },
}

function fmt(d: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export default async function AdminRefundsPage() {
  const rows = await listPendingRefunds()
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Remboursements en attente
        </h1>
        <p className="text-sm text-muted-foreground">
          Paiements GoalPay marqués REFUND_PENDING. Une fois l’argent ré-envoyé
          au locataire via le support GoalPay, marque-le « Remboursé » avec en
          note l’ID du ticket support et la nouvelle transaction GoalPay.
        </p>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
          title="Aucun refund en attente"
          description="Tout est à jour — bravo. Les nouveaux refunds apparaîtront ici dès qu’un bail expire avec un paiement confirmé ou qu’un conflit lease engendre un remboursement automatique."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/60">
              <tr>
                <th className="px-3 py-2 font-medium">Demandé le</th>
                <th className="px-3 py-2 font-medium">Locataire</th>
                <th className="px-3 py-2 font-medium">Montant</th>
                <th className="px-3 py-2 font-medium">Téléphone</th>
                <th className="px-3 py-2 font-medium">Lease</th>
                <th className="px-3 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border align-top">
                  <td className="whitespace-nowrap px-3 py-3 text-foreground/70">
                    {fmt(row.createdAt)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-foreground">{row.user.name ?? '—'}</div>
                    <div className="text-[11px] text-foreground/55">{row.user.email}</div>
                  </td>
                  <td className="px-3 py-3 font-mono">
                    {formatAriary(row.amountMGA)}
                  </td>
                  <td className="px-3 py-3 font-mono text-foreground/70">
                    {row.payerPhone ?? '—'}
                  </td>
                  <td className="px-3 py-3">
                    {row.lease ? (
                      <a
                        href={`/dashboard/leases/${row.lease.id}`}
                        className="text-primary hover:underline"
                      >
                        {row.lease.id.slice(0, 8)}…
                      </a>
                    ) : (
                      <span className="text-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <MarkRefundedRow paymentId={row.id} />
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
