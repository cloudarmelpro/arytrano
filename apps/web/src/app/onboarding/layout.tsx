import type { ReactNode } from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'

/**
 * Onboarding flows (T-049 owner terms, future post-OAuth role pickers)
 * use the chrome of public pages (Header + Footer) but bypass the
 * dashboard sidebar — the visitor is signed in but not yet allowed
 * into the dashboard until they complete the gate.
 */
export default function OnboardingLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1 bg-background">
        {children}
      </main>
      <Footer />
    </>
  )
}
