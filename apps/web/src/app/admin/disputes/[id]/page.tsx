import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/features/auth'
import { getDisputeById } from '@/features/disputes/server'
import { ClaimDisputeButton } from '@/features/disputes/components/ClaimDisputeButton'
import { ResolveDisputeForm } from '@/features/disputes/components/ResolveDisputeForm'
import { PostDisputeMessageForm } from '@/features/disputes/components/PostDisputeMessageForm'
import { cloudinaryThumbnail } from '@/lib/cloudinary/thumbnail'
import { formatAriary } from '@/lib/format/currency'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Litige — Admin',
  robots: { index: false, follow: false },
}

function fmtDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminDisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const adminId = session!.user!.id

  const d = await getDisputeById(id)
  if (!d) notFound()

  // After the audit fix (2026-06-12) claim and resolve are tracked
  // separately. isClaimedByMe drives the "Rendre le verdict" form ;
  // hijack attempts on someone else's claim now hit a service-side
  // reject (`already_claimed`).
  const isClaimedByMe = d.claimedById === adminId && d.status === 'IN_REVIEW'
  const isResolvable = isClaimedByMe
  const entry = d.lease.inventoryItems.filter((i) => i.phase === 'ENTRY')
  const exit = d.lease.inventoryItems.filter((i) => i.phase === 'EXIT')

  return (
    <div>
      <Link
        href="/admin/disputes"
        className="mb-3 inline-block text-[12.5px] text-foreground/60 hover:text-primary"
      >
        ← Retour aux litiges
      </Link>

      <header className="mb-6">
        <h1 className="text-[22px] font-bold tracking-tight">
          Litige sur « {d.lease.listing.title} »
        </h1>
        <p className="mt-1 text-[13px] text-foreground/65">
          Ouvert par <strong>{d.openedByRole}</strong> · Montant{' '}
          {formatAriary(d.amountAtStakeMGA)} · SLA {fmtDate(d.slaDueAt)} ·{' '}
          Status <code className="font-mono">{d.status}</code>
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <main className="flex flex-col gap-6">
          {/* Parties + recap */}
          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
              Parties
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-[13px]">
              <div>
                <span className="block text-[11.5px] uppercase tracking-[0.06em] text-foreground/55">
                  Propriétaire
                </span>
                <span className="font-medium">{d.lease.owner.name ?? '—'}</span>
                <span className="block text-foreground/65">
                  {d.lease.owner.email}
                </span>
              </div>
              <div>
                <span className="block text-[11.5px] uppercase tracking-[0.06em] text-foreground/55">
                  Locataire
                </span>
                <span className="font-medium">{d.lease.tenant.name ?? '—'}</span>
                <span className="block text-foreground/65">
                  {d.lease.tenant.email}
                </span>
              </div>
              <div>
                <span className="block text-[11.5px] uppercase tracking-[0.06em] text-foreground/55">
                  Caution
                </span>
                <span className="font-mono">
                  {formatAriary(d.lease.cautionMGA)}
                </span>
              </div>
              <div>
                <span className="block text-[11.5px] uppercase tracking-[0.06em] text-foreground/55">
                  Loyer
                </span>
                <span className="font-mono">
                  {formatAriary(d.lease.monthlyRentMGA)}
                </span>
              </div>
            </div>
          </section>

          {/* Inventory side by side */}
          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
              État des lieux comparé
            </h2>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <InventoryColumn title="Entrée" items={entry} />
              <InventoryColumn title="Sortie" items={exit} />
            </div>
          </section>

          {/* Message timeline */}
          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
              Conversation
            </h2>
            <ul className="mt-3 flex flex-col gap-3">
              {d.messages.map((m) => (
                <li
                  key={m.id}
                  className={`rounded-md border px-3 py-2 text-[13.5px] ${
                    m.isVerdict
                      ? 'border-amber-300 bg-amber-50/60'
                      : m.authorRole === 'OWNER'
                        ? 'border-blue-200 bg-blue-50/60'
                        : 'border-emerald-200 bg-emerald-50/60'
                  }`}
                >
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 text-[11.5px] text-foreground/60">
                    <span>
                      {m.isVerdict ? '⚖️ AryTrano — verdict' : m.authorRole} ·{' '}
                      {m.author?.name ?? '—'}
                    </span>
                    <span>{fmtDate(m.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-[1.55]">{m.body}</p>
                </li>
              ))}
            </ul>
            {!['OPEN', 'IN_REVIEW'].includes(d.status) ? null : (
              <div className="mt-4 border-t border-border pt-4">
                <PostDisputeMessageForm disputeId={d.id} />
              </div>
            )}
          </section>
        </main>

        <aside className="flex flex-col gap-4">
          <section className="rounded-xl border border-border bg-background p-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
              Action admin
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              {d.status === 'OPEN' ? (
                <ClaimDisputeButton disputeId={d.id} />
              ) : null}
              {d.status === 'IN_REVIEW' && !isClaimedByMe ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900">
                  Claimé par <strong>{d.claimedBy?.name ?? '?'}</strong>.
                  Pour reprendre la main, l’admin doit relâcher d’abord
                  (hors flow self-service).
                </p>
              ) : null}
              {isResolvable ? <ResolveDisputeForm disputeId={d.id} /> : null}
              {d.resolvedAt ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-900">
                  ✓ Résolu le {fmtDate(d.resolvedAt)} par{' '}
                  {d.resolvedBy?.name ?? '?'}
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function InventoryColumn({
  title,
  items,
}: {
  title: string
  items: Array<{
    id: string
    roomKey: string
    notes: string | null
    photoUrls: string[]
  }>
}) {
  return (
    <div>
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-foreground/60">
        {title}
      </h3>
      <div className="mt-2 flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-[12.5px] text-foreground/55">Aucun élément.</p>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="rounded-md border border-border bg-muted/20 p-2 text-[12.5px]"
            >
              <div className="font-mono font-semibold">{it.roomKey}</div>
              {it.photoUrls.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {it.photoUrls.slice(0, 6).map((url) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={url}
                      src={cloudinaryThumbnail(url, { width: 96, height: 96 })}
                      alt={`Photo ${it.roomKey}${it.notes ? ' — ' + it.notes.slice(0, 60) : ''}`}
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 rounded object-cover"
                    />
                  ))}
                  {it.photoUrls.length > 6 ? (
                    <span className="self-center text-[11px] text-foreground/55">
                      +{it.photoUrls.length - 6}
                    </span>
                  ) : null}
                </div>
              ) : null}
              {it.notes ? (
                <p className="mt-1 whitespace-pre-wrap text-foreground/75">
                  {it.notes}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
