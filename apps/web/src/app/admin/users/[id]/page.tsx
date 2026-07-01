import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/features/auth'
import { prisma } from '@/lib/db'
import { listAdminNotes } from '@/features/admin-notes/server'
import { AdminNotesPanel } from '@/features/admin-notes/components/AdminNotesPanel'
import { SuspendUserPanel } from '@/features/admin/components/SuspendUserPanel'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Utilisateur — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const callerId = session!.user!.id // gated by /admin layout

  const [user, notes] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneVerifiedAt: true,
        role: true,
        status: true,
        suspendedReason: true,
        createdAt: true,
        emailVerified: true,
        _count: {
          select: {
            listings: true,
            ownerLeases: true,
            tenantLeases: true,
          },
        },
      },
    }),
    listAdminNotes('User', id),
  ])
  if (!user) notFound()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link href="/admin" className="text-xs text-muted-foreground hover:underline">
          ← Tableau de bord
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">
          {user.name ?? user.email}
        </h1>
        <p className="text-sm text-muted-foreground">
          {user.role} · {user.status}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-foreground/55">Email</dt>
          <dd className="break-words font-mono text-foreground/85">{user.email}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-foreground/55">Téléphone</dt>
          <dd className="font-mono text-foreground/85">
            {user.phone ?? '—'}
            {user.phone && user.phoneVerifiedAt ? (
              <span className="ml-2 text-[11px] text-emerald-700">vérifié</span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-foreground/55">Annonces</dt>
          <dd className="font-mono">{user._count.listings}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-foreground/55">Baux</dt>
          <dd className="font-mono">
            {user._count.ownerLeases + user._count.tenantLeases}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-foreground/55">Email vérifié</dt>
          <dd className="font-mono">{user.emailVerified ? 'oui' : 'non'}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-foreground/55">Inscrit</dt>
          <dd className="font-mono text-foreground/70">
            {new Intl.DateTimeFormat('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: '2-digit',
            }).format(user.createdAt)}
          </dd>
        </div>
      </dl>

      <SuspendUserPanel
        userId={user.id}
        status={user.status}
        currentReason={user.suspendedReason}
      />

      <AdminNotesPanel
        targetType="User"
        targetId={user.id}
        notes={notes.map((n) => ({
          id: n.id,
          body: n.body,
          createdAt: n.createdAt.toISOString(),
          author: n.author,
        }))}
        currentUserId={callerId}
        revalidatePath={`/admin/users/${user.id}`}
      />
    </div>
  )
}
