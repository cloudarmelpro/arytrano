import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { AuthSidePanel } from '@/components/shared/AuthSidePanel'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1 bg-background">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-12 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:px-10 lg:py-16">
          <div className="flex flex-col">{children}</div>
          <AuthSidePanel />
        </div>
      </main>
      <Footer />
    </>
  )
}
