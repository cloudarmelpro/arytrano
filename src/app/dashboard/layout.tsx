import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { AccountSidebar } from '@/components/shared/AccountSidebar'
import { auth } from '@/features/auth'
import { getProfile } from '@/features/auth/server'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  // Sidebar needs avatar + name + email — fetch once at the layout level so
  // every dashboard page below gets the same widget without re-querying.
  const profile = await getProfile(session.user.id)

  return (
    <>
      <Header />
      <main id="main" className="flex-1 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 md:flex-row md:gap-12">
          <AccountSidebar
            role={session.user.role}
            user={{ name: profile.name, email: profile.email, image: profile.image }}
          />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}
