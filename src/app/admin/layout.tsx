import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { AdminSidebar } from '@/components/shared/AdminSidebar'
import { auth } from '@/features/auth'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * Admin layout (T-022). Hard-gates every page under `/admin/*` to users
 * with role === ADMIN. Anyone else gets redirected:
 *   - Unauthenticated → /sign-in
 *   - Authenticated non-ADMIN → /dashboard
 *
 * Role is re-read from the DB (not the JWT) so a demoted admin immediately
 * loses access on the next request — closes the JWT staleness gap that
 * affected READ paths previously (security audit H2).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  // Live DB read on every admin request — covers both the role check and
  // the open-reports count in a single round-trip via two parallel queries.
  const [dbUser, openReports] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, status: true },
    }),
    prisma.report.count({ where: { status: 'OPEN' } }),
  ])
  if (!dbUser || dbUser.status !== 'ACTIVE' || dbUser.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <>
      <Header />
      <main id="main" className="flex-1 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 md:flex-row md:gap-12">
          <AdminSidebar openReports={openReports} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}
