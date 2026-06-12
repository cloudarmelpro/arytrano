import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/features/auth'
import { getLeadById } from '@/features/leads/server'

export const metadata: Metadata = {
  title: 'Lead — Admin',
  robots: { index: false, follow: false },
}
import { ClaimLeadButton } from '@/features/leads/components/ClaimLeadButton'
import { TransitionLeadForm } from '@/features/leads/components/TransitionLeadForm'
import { ConvertLeadForm } from '@/features/leads/components/ConvertLeadForm'
import {
  buildNewLeadOwnerLink,
  buildOwnerReminderLink,
  buildTenantFollowUpLink,
  buildNoResponseLink,
  buildLeasePaidOwnerLink,
} from '@/lib/wa-me'
import { formatAriary } from '@/lib/format/currency'

export const dynamic = 'force-dynamic'

function fmtDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const operatorId = session!.user!.id
  const operatorName = session!.user!.name ?? 'AryTrano'

  const lead = await getLeadById(id)
  if (!lead) notFound()

  const isMine = lead.claimedBy?.id === operatorId
  const ownerPhone = lead.listing.owner.phone
  const tenantPhone = lead.tenantPhone

  const waLinks = ownerPhone
    ? {
        newLead: buildNewLeadOwnerLink({
          recipientPhoneE164: ownerPhone,
          recipientName: lead.listing.owner.name ?? 'Propriétaire',
          operatorName,
          locale: lead.listing.owner.locale === 'MG' ? 'mg' : 'fr-MG',
          tenantName: lead.tenantName,
          listingTitle: lead.listing.title,
          listingUrl: `https://arytrano.com/${lead.listing.city.slug}/${lead.listing.neighborhood.slug}/${lead.listing.slug}`,
        }),
        ownerReminder: buildOwnerReminderLink({
          recipientPhoneE164: ownerPhone,
          recipientName: lead.listing.owner.name ?? 'Propriétaire',
          operatorName,
          locale: lead.listing.owner.locale === 'MG' ? 'mg' : 'fr-MG',
          listingTitle: lead.listing.title,
          listingUrl: `https://arytrano.com/${lead.listing.city.slug}/${lead.listing.neighborhood.slug}/${lead.listing.slug}`,
        }),
        leasePaid: buildLeasePaidOwnerLink({
          recipientPhoneE164: ownerPhone,
          recipientName: lead.listing.owner.name ?? 'Propriétaire',
          operatorName,
          locale: lead.listing.owner.locale === 'MG' ? 'mg' : 'fr-MG',
          tenantName: lead.tenantName,
          listingTitle: lead.listing.title,
          listingUrl: `https://arytrano.com/${lead.listing.city.slug}/${lead.listing.neighborhood.slug}/${lead.listing.slug}`,
        }),
      }
    : null

  const tenantLinks = {
    followUp: buildTenantFollowUpLink({
      recipientPhoneE164: tenantPhone,
      recipientName: lead.tenantName,
      operatorName,
      locale: 'fr-MG',
      listingTitle: lead.listing.title,
      listingUrl: `https://arytrano.com/${lead.listing.city.slug}/${lead.listing.neighborhood.slug}/${lead.listing.slug}`,
    }),
    noResponse: buildNoResponseLink({
      recipientPhoneE164: tenantPhone,
      recipientName: lead.tenantName,
      operatorName,
      locale: 'fr-MG',
      listingTitle: lead.listing.title,
      listingUrl: `https://arytrano.com/${lead.listing.city.slug}/${lead.listing.neighborhood.slug}/${lead.listing.slug}`,
    }),
  }

  return (
    <div>
      <Link
        href="/admin/leads"
        className="mb-3 inline-block text-[12.5px] text-foreground/60 hover:text-primary"
      >
        ← Retour à la file
      </Link>

      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold leading-tight tracking-tight">
            {lead.tenantName}
          </h1>
          <p className="text-[13.5px] text-foreground/65">
            {lead.tenantPhone} · créé {fmtDate(lead.createdAt)} ·{' '}
            <span className="font-mono">{lead.status}</span>
            {lead.source ? ` · src=${lead.source}` : ''}
          </p>
        </div>
        {lead.status === 'NEW' ? (
          <ClaimLeadButton leadId={lead.id} />
        ) : lead.claimedBy ? (
          <span className="rounded-md border border-border bg-muted/30 px-3 py-1.5 text-[12.5px] text-foreground/75">
            Claimé par {lead.claimedBy.name ?? '?'}
            {isMine ? ' (toi)' : ''}
          </span>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <main className="flex flex-col gap-6">
          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
              Annonce
            </h2>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
              <Link
                href={`/${lead.listing.city.slug}/${lead.listing.neighborhood.slug}/${lead.listing.slug}`}
                className="font-bold text-foreground hover:text-primary"
              >
                {lead.listing.title}
              </Link>
              <span className="font-mono text-primary">
                {formatAriary(lead.listing.priceMonthlyMGA)} / mois
              </span>
            </div>
            <p className="mt-1 text-[13px] text-foreground/65">
              {lead.listing.city.nameFr} · {lead.listing.neighborhood.nameFr} ·{' '}
              statut {lead.listing.status}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="text-[13px]">
                <span className="block text-[11.5px] uppercase tracking-[0.06em] text-foreground/55">
                  Propriétaire
                </span>
                <span className="font-medium">
                  {lead.listing.owner.name ?? '—'}
                </span>
                <span className="block text-foreground/65">
                  {lead.listing.owner.phone ?? 'pas de phone'}
                </span>
              </div>
              <div className="text-[13px]">
                <span className="block text-[11.5px] uppercase tracking-[0.06em] text-foreground/55">
                  Préférences locataire
                </span>
                <span className="block">
                  Move-in : {lead.moveInWindow}
                </span>
                <span className="block">
                  Budget confirmé :{' '}
                  {lead.budgetConfirmed ? '✓ oui' : '✗ non'}
                </span>
              </div>
            </div>
          </section>

          {isMine ? (
            <>
              <section className="rounded-xl border border-border bg-background p-5">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
                  Avancer le lead
                </h2>
                <div className="mt-3">
                  <TransitionLeadForm leadId={lead.id} />
                </div>
              </section>

              {lead.status !== 'CONVERTED' && lead.status !== 'REJECTED' && lead.status !== 'LAPSED' ? (
                <section className="rounded-xl border border-primary/30 bg-primary/[0.04] p-5">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary">
                    Convertir en bail
                  </h2>
                  <p className="mt-1 text-[12.5px] text-foreground/70">
                    Crée le Lease en PENDING_TENANT au nom du propriétaire et
                    flippe le lead vers CONVERTED.
                  </p>
                  <div className="mt-3">
                    <ConvertLeadForm
                      leadId={lead.id}
                      defaultTenantEmail={lead.tenant?.email ?? undefined}
                    />
                  </div>
                </section>
              ) : null}
            </>
          ) : null}

          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
              Activity timeline
            </h2>
            <ul className="mt-3 flex flex-col gap-3">
              {lead.activities.map((a) => (
                <li
                  key={a.id}
                  className="rounded-md border border-border/60 bg-muted/20 px-3 py-2"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-[12.5px]">
                    <span className="font-mono font-semibold">{a.type}</span>
                    <span className="text-foreground/60">
                      {fmtDate(a.createdAt)} · {a.actorRole}
                      {a.actor?.name ? ` (${a.actor.name})` : ''}
                    </span>
                  </div>
                  {a.payload &&
                  typeof a.payload === 'object' &&
                  Object.keys(a.payload as object).length > 0 ? (
                    <pre className="mt-1 max-w-full overflow-x-auto rounded bg-background p-2 text-[11px] leading-snug text-foreground/75">
                      {JSON.stringify(a.payload, null, 2)}
                    </pre>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </main>

        <aside className="flex flex-col gap-4">
          <section className="rounded-xl border border-border bg-background p-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
              WhatsApp templates
            </h3>
            <p className="mt-1 text-[11.5px] text-foreground/55">
              Lien `wa.me` pré-rempli — clique pour ouvrir WhatsApp.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {waLinks ? (
                <>
                  <WaLink href={waLinks.newLead.url} label="→ Owner : nouveau lead" />
                  <WaLink
                    href={waLinks.ownerReminder.url}
                    label="→ Owner : relance"
                  />
                  <WaLink
                    href={waLinks.leasePaid.url}
                    label="→ Owner : bail payé"
                  />
                </>
              ) : (
                <p className="text-[12px] text-foreground/55">
                  Propriétaire sans phone — joindre par email.
                </p>
              )}
              <WaLink
                href={tenantLinks.followUp.url}
                label="→ Tenant : relance"
              />
              <WaLink
                href={tenantLinks.noResponse.url}
                label="→ Tenant : sans réponse"
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function WaLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md border border-border bg-background px-3 py-2 text-[12.5px] font-medium text-foreground/85 transition hover:border-primary/40 hover:bg-primary/[0.04]"
    >
      {label}
      <span className="sr-only"> (ouvre WhatsApp dans un nouvel onglet)</span>
    </a>
  )
}
