import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { AdminSidebar } from '@/components/shared/AdminSidebar'
import { auth } from '@/features/auth'
import { getAdminContext } from '@/features/admin/server'

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
  if (!session?.user) redirect('/sign-in?reason=session-expired')

  // Live DB read on every admin request — closes JWT staleness and feeds
  // the sidebar badge in one round-trip. See getAdminContext for details.
  const { user: dbUser, openReports } = await getAdminContext(session.user.id)
  if (!dbUser || dbUser.status !== 'ACTIVE' || dbUser.role !== 'ADMIN') {
    // Reaching here = JWT said ADMIN but DB no longer agrees (demoted
    // or suspended). Send them to the regular dashboard with a hint.
    redirect('/dashboard?reason=admin-revoked')
  }

  // SEC-02 — 2FA is MANDATORY for admins. Block every /admin/* page
  // until the admin enables TOTP. We send them to /dashboard/settings
  // (where the TwoFactorSection lives) with a query so the page can
  // surface a clear "tu dois activer la 2FA pour accéder à l'admin"
  // banner. The credentials sign-in flow already enforces TOTP on
  // every login once enabled, so this gate only fires for admins
  // who haven't set it up yet.
  if (!dbUser.totpEnabledAt) {
    redirect('/dashboard/settings?reason=admin-2fa-required#two-factor')
  }

  return (
    <>
      <Header />
      <main id="main" className="flex-1 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 md:flex-row md:gap-12">
          <AdminSidebar
            openReports={openReports}
            user={{ name: dbUser.name, email: dbUser.email, image: dbUser.image }}
          />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}
